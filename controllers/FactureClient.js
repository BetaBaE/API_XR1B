const { getConnection, getSql } = require("../database/connection");
const { FactureClient } = require("../database/FactureClientQuery");
const { Users } = require("../database/UserQuery");

const ALLOWED_SORT_FIELDS = {
  id: "fc.id",
  idMarche: "fc.idMarche",
  numeroFacture: "fc.numeroFacture",
  dateFacture: "fc.dateFacture",
  HT: "fc.HT",
  Tva: "fc.Tva",
  TTC: "fc.TTC",
  etat: "fc.etat",
  CautionRG: "fc.CautionRG",
  netTTC: "fc.netTTC",
  marcheNumero: "m.numero",
  codeAffaire: "m.codeAffaire",
  cautionNumero: "c.numero",
  chantierLibelle: "ch.LIBELLE",
  createdAt: "fc.createdAt",
  updatedAt: "fc.updatedAt",
};

const toNumber = (value, defaultValue = 0) => {
  if (value == null || value === "") return defaultValue;
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
};

const round3 = (value) => Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;

const isValidNumeric153 = (value) => {
  if (value == null || value === "") return false;
  const num = Number(value);
  if (!Number.isFinite(num)) return false;
  const [intPart, decPart = ""] = String(Math.abs(num)).split(".");
  return intPart.length <= 12 && decPart.length <= 3;
};

const parseListParams = (req) => {
  let range = req.query.range || "[0,9]";
  let sort = req.query.sort || '["id", "ASC"]';
  let filter = req.query.filter || "{}";

  range = JSON.parse(range);
  sort = JSON.parse(sort);
  filter = JSON.parse(filter);

  return { range, sort, filter };
};

const VALID_ETAT = ["saisie", "annulee"];

const applyFilterInputs = (request, filter = {}) => {
  const whereParts = [];

  if (filter.idMarche) {
    whereParts.push("AND fc.idMarche = @idMarche");
    request.input("idMarche", getSql().Int, Number(filter.idMarche));
  }

  if (filter.numeroFacture) {
    whereParts.push("AND fc.numeroFacture LIKE @numeroFacture");
    request.input("numeroFacture", getSql().VarChar, `%${filter.numeroFacture}%`);
  }
  if (filter.etat) {
    whereParts.push("AND fc.etat = @etat");
    request.input("etat", getSql().VarChar, filter.etat);
  }

  const dateFrom = filter.dateFacture_gte || filter.dateFactureFrom || null;
  const dateTo = filter.dateFacture_lte || filter.dateFactureTo || null;

  if (dateFrom) {
    whereParts.push("AND fc.dateFacture >= @dateFrom");
    request.input("dateFrom", getSql().Date, dateFrom);
  }

  if (dateTo) {
    whereParts.push("AND fc.dateFacture <= @dateTo");
    request.input("dateTo", getSql().Date, dateTo);
  }

  return whereParts.join(" ");
};

const resolveActor = async (req) => {
  const fromReqUser = req.user?.username || req.user?.fullname || null;
  if (fromReqUser) return fromReqUser;

  if (!req.auth?.id) return null;

  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", getSql().Int, Number(req.auth.id))
    .query(Users.getOne);

  const user = result.recordset[0];
  return user?.username || user?.fullname || null;
};

const computeFacture = async (pool, payload) => {
  const idMarche = Number(payload.idMarche);
  const HT = round3(toNumber(payload.HT));
  const RestitAccompte = round3(toNumber(payload.RestitAccompte));
  const retenueGarantie1 = round3(toNumber(payload.retenueGarantie1));
  const retenueGarantie2 = round3(toNumber(payload.retenueGarantie2));
  const Penalite = round3(toNumber(payload.Penalite));
  const Approvisionnement = round3(toNumber(payload.Approvisionnement));
  const revPrix = round3(toNumber(payload.revPrix));
  const idCautionRG = payload.idCautionRG ? Number(payload.idCautionRG) : null;

  if (!Number.isInteger(idMarche) || idMarche <= 0) {
    throw new Error("idMarche is required and must be a valid integer");
  }

  if (!isValidNumeric153(HT)) {
    throw new Error(
      "HT must respect NUMERIC(15,3): max 12 integer digits and 3 decimals"
    );
  }

  const marcheResult = await pool
    .request()
    .input("idMarche", getSql().Int, idMarche)
    .query(FactureClient.getMarcheById);

  const marche = marcheResult.recordset[0];
  if (!marche) {
    throw new Error("Marche not found for idMarche");
  }

  const tauxTva = toNumber(marche.tauxTva, 1);
  const TTC = round3(HT * tauxTva);
  const Tva = round3(TTC - HT);

  let CautionRG = 0;
  if (idCautionRG) {
    const cautionResult = await pool
      .request()
      .input("idCautionRG", getSql().Int, idCautionRG)
      .query(FactureClient.getCautionById);
    const caution = cautionResult.recordset[0];
    if (!caution) {
      throw new Error("Caution not found for idCautionRG");
    }
    if (Number(caution.idMarche) !== idMarche || caution.type !== "CRG") {
      throw new Error("idCautionRG must be a CRG caution belonging to the selected marché");
    }
    CautionRG = round3(toNumber(caution.montant));
  }

  const netTTC = round3(
    TTC -
      RestitAccompte -
      retenueGarantie1 -
      retenueGarantie2 -
      Penalite -
      Approvisionnement +
      CautionRG +
      revPrix
  );

  return {
    idMarche,
    HT,
    Tva,
    TTC,
    RestitAccompte,
    retenueGarantie1,
    retenueGarantie2,
    CautionRG,
    idCautionRG,
    Penalite,
    Approvisionnement,
    revPrix,
    netTTC,
    tauxTva,
  };
};

exports.getFactureClientCount = async (req, res, next) => {
  try {
    const { filter } = parseListParams(req);
    const pool = await getConnection();
    const request = pool.request();
    const whereClause = applyFilterInputs(request, filter);
    const result = await request.query(`${FactureClient.getCount} ${whereClause}`);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFactureClient = async (req, res) => {
  try {
    const { range, sort, filter } = parseListParams(req);
    const sortField = ALLOWED_SORT_FIELDS[sort[0]] || "fc.id";
    const sortOrder = String(sort[1]).toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pageSize = range[1] + 1 - range[0];

    const pool = await getConnection();
    const request = pool.request();
    const whereClause = applyFilterInputs(request, filter);
    request.input("offset", getSql().Int, range[0]);
    request.input("limit", getSql().Int, pageSize);

    const result = await request.query(
      `${FactureClient.getAll} ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `factureclient ${range[0]}-${range[1]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFactureClientById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, Number(req.params.id))
      .query(FactureClient.getOne);

    res.set("Content-Range", "factureclient 0-0/1");
    res.json(result.recordset[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCautionsDisponiblesByMarche = async (req, res) => {
  try {
    const idMarche = Number(req.params.idMarche);
    if (!Number.isInteger(idMarche) || idMarche <= 0) {
      return res.status(400).json({ error: "idMarche must be a valid integer" });
    }
    const parsedCurrentFactureId = req.query.currentFactureId
      ? Number(req.query.currentFactureId)
      : null;
    const currentFactureId = Number.isInteger(parsedCurrentFactureId)
      ? parsedCurrentFactureId
      : null;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("idMarche", getSql().Int, idMarche)
      .input("currentFactureId", getSql().Int, currentFactureId)
      .query(FactureClient.getCautionsDisponibles);

    res.set(
      "Content-Range",
      `cautions-disponibles 0-${Math.max(result.recordset.length - 1, 0)}/${
        result.recordset.length
      }`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFactureClient = async (req, res) => {
  try {
    const { numeroFacture, dateFacture } = req.body;
    if (!numeroFacture || !dateFacture || !req.body.idMarche || req.body.HT == null) {
      return res.status(400).json({
        error: "idMarche, numeroFacture, dateFacture and HT are required",
      });
    }

    const pool = await getConnection();
    const computed = await computeFacture(pool, req.body);
    const etat = req.body.etat || "saisie";
    if (!VALID_ETAT.includes(etat)) {
      return res.status(400).json({ error: "Invalid etat value" });
    }
    const createdBy = await resolveActor(req);

    const result = await pool
      .request()
      .input("idMarche", getSql().Int, computed.idMarche)
      .input("numeroFacture", getSql().VarChar, numeroFacture)
      .input("dateFacture", getSql().Date, dateFacture)
      .input("HT", getSql().Numeric(15, 3), computed.HT)
      .input("Tva", getSql().Numeric(15, 3), computed.Tva)
      .input("TTC", getSql().Numeric(15, 3), computed.TTC)
      .input("RestitAccompte", getSql().Numeric(15, 3), computed.RestitAccompte)
      .input("retenueGarantie1", getSql().Numeric(15, 3), computed.retenueGarantie1)
      .input("retenueGarantie2", getSql().Numeric(15, 3), computed.retenueGarantie2)
      .input("CautionRG", getSql().Numeric(15, 3), computed.CautionRG)
      .input("idCautionRG", getSql().Int, computed.idCautionRG)
      .input("Penalite", getSql().Numeric(15, 3), computed.Penalite)
      .input("Approvisionnement", getSql().Numeric(15, 3), computed.Approvisionnement)
      .input("revPrix", getSql().Numeric(15, 3), computed.revPrix)
      .input("netTTC", getSql().Numeric(15, 3), computed.netTTC)
      .input("etat", getSql().VarChar, etat)
      .input("createdBy", getSql().VarChar, createdBy)
      .query(FactureClient.create);

    res.status(201).json({
      id: result.recordset[0].id,
      ...req.body,
      ...computed,
      etat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFactureClient = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { numeroFacture, dateFacture } = req.body;

    const pool = await getConnection();
    const currentResult = await pool
      .request()
      .input("id", getSql().Int, id)
      .query(FactureClient.getEtatById);
    const currentFacture = currentResult.recordset[0];
    if (!currentFacture) {
      return res.status(404).json({ error: "Facture client introuvable" });
    }
    if (currentFacture.etat === "annulee") {
      return res.status(403).json({
        error: "Cette facture est annulée et ne peut plus être modifiée.",
      });
    }
    req.body.idMarche = currentFacture.idMarche;
    if (!numeroFacture || !dateFacture || !req.body.idMarche || req.body.HT == null) {
      return res.status(400).json({
        error: "idMarche, numeroFacture, dateFacture and HT are required",
      });
    }

    const computed = await computeFacture(pool, req.body);
    const etat = req.body.etat || currentFacture.etat || "saisie";
    if (!VALID_ETAT.includes(etat)) {
      return res.status(400).json({ error: "Invalid etat value" });
    }
    const updatedBy = await resolveActor(req);

    await pool
      .request()
      .input("id", getSql().Int, id)
      .input("idMarche", getSql().Int, computed.idMarche)
      .input("numeroFacture", getSql().VarChar, numeroFacture)
      .input("dateFacture", getSql().Date, dateFacture)
      .input("HT", getSql().Numeric(15, 3), computed.HT)
      .input("Tva", getSql().Numeric(15, 3), computed.Tva)
      .input("TTC", getSql().Numeric(15, 3), computed.TTC)
      .input("RestitAccompte", getSql().Numeric(15, 3), computed.RestitAccompte)
      .input("retenueGarantie1", getSql().Numeric(15, 3), computed.retenueGarantie1)
      .input("retenueGarantie2", getSql().Numeric(15, 3), computed.retenueGarantie2)
      .input("CautionRG", getSql().Numeric(15, 3), computed.CautionRG)
      .input("idCautionRG", getSql().Int, computed.idCautionRG)
      .input("Penalite", getSql().Numeric(15, 3), computed.Penalite)
      .input("Approvisionnement", getSql().Numeric(15, 3), computed.Approvisionnement)
      .input("revPrix", getSql().Numeric(15, 3), computed.revPrix)
      .input("netTTC", getSql().Numeric(15, 3), computed.netTTC)
      .input("etat", getSql().VarChar, etat)
      .input("updatedBy", getSql().VarChar, updatedBy)
      .query(FactureClient.update);

    res.json({
      id,
      ...req.body,
      ...computed,
      etat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
