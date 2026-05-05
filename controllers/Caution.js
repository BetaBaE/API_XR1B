const { getConnection, getSql } = require("../database/connection");
const { Caution } = require("../database/CautionQuery");
const { Users } = require("../database/UserQuery");

const ALLOWED_SORT_FIELDS = {
  id: "c.id",
  numero: "c.numero",
  nature: "c.nature",
  type: "c.type",
  idMarche: "c.idMarche",
  origine: "c.origine",
  montant: "c.montant",
  taux: "c.taux",
  marcheNumero: "m.numero",
  codeAffaire: "m.codeAffaire",
  banqueNom: "b.nom",
  fournisseurNom: "f.nom",
  chantierLibelle: "ch.LIBELLE",
  createdAt: "c.createdAt",
  updatedAt: "c.updatedAt",
};

const VALID_NATURE = ["globale", "specifique"];
const VALID_TYPE = ["CP", "CD", "CRG", "CRA", "CDIV", "CDEC"];
const VALID_ORIGINE = ["MIDELT", "RABAT"];

const isValidMontantPrecision = (value) => {
  if (value == null || value === "") return false;
  const num = Number(value);
  if (!Number.isFinite(num)) return false;
  const abs = Math.abs(num);
  const [intPart, decPart = ""] = String(abs).split(".");
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

const applyFilterInputs = (request, filter = {}) => {
  const whereParts = [];

  if (filter.nature) {
    whereParts.push("AND c.nature = @nature");
    request.input("nature", getSql().VarChar, filter.nature);
  }

  if (filter.type) {
    whereParts.push("AND c.type = @type");
    request.input("type", getSql().VarChar, filter.type);
  }

  if (filter.origine) {
    whereParts.push("AND c.origine = @origine");
    request.input("origine", getSql().VarChar, filter.origine);
  }

  if (filter.idMarche) {
    whereParts.push("AND c.idMarche = @idMarche");
    request.input("idMarche", getSql().Int, Number(filter.idMarche));
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

exports.getCautionCount = async (req, res, next) => {
  try {
    const { filter } = parseListParams(req);
    const pool = await getConnection();
    const request = pool.request();
    const whereClause = applyFilterInputs(request, filter);
    const result = await request.query(`${Caution.getCount} ${whereClause}`);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCaution = async (req, res) => {
  try {
    const { range, sort, filter } = parseListParams(req);

    const sortField = ALLOWED_SORT_FIELDS[sort[0]] || "c.id";
    const sortOrder = String(sort[1]).toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pageSize = range[1] + 1 - range[0];

    const pool = await getConnection();
    const request = pool.request();
    const whereClause = applyFilterInputs(request, filter);
    request.input("offset", getSql().Int, range[0]);
    request.input("limit", getSql().Int, pageSize);

    const result = await request.query(
      `${Caution.getAll} ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
    );

    res.set("Content-Range", `caution ${range[0]}-${range[1]}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCautionById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, Number(req.params.id))
      .query(Caution.getOne);

    res.set("Content-Range", "caution 0-0/1");
    res.json(result.recordset[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCaution = async (req, res) => {
  try {
    const {
      numero,
      banqueId = null,
      nature,
      type,
      idMarche,
      numeroDossier = null,
      dateDelivrance = null,
      dateEcheance = null,
      montant,
      idFournisseur = null,
      origine,
      taux = null,
    } = req.body;

    if (!numero || !nature || !type || !idMarche || montant == null || !origine) {
      return res.status(400).json({
        error: "numero, nature, type, idMarche, montant and origine are required",
      });
    }

    if (!VALID_NATURE.includes(nature)) {
      return res.status(400).json({ error: "Invalid nature value" });
    }

    if (!VALID_TYPE.includes(type)) {
      return res.status(400).json({ error: "Invalid type value" });
    }

    if (!VALID_ORIGINE.includes(origine)) {
      return res.status(400).json({ error: "Invalid origine value" });
    }

    if (!isValidMontantPrecision(montant)) {
      return res.status(400).json({
        error: "montant must respect NUMERIC(15,3): max 12 integer digits and 3 decimals",
      });
    }

    const createdBy = await resolveActor(req);

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numero", getSql().VarChar, numero)
      .input("banqueId", getSql().Int, banqueId)
      .input("nature", getSql().VarChar, nature)
      .input("type", getSql().VarChar, type)
      .input("idMarche", getSql().Int, Number(idMarche))
      .input("numeroDossier", getSql().VarChar, numeroDossier)
      .input("dateDelivrance", getSql().Date, dateDelivrance)
      .input("dateEcheance", getSql().Date, dateEcheance)
      .input("montant", getSql().Numeric(15, 3), Number(montant))
      .input("idFournisseur", getSql().Int, idFournisseur)
      .input("origine", getSql().VarChar, origine)
      .input("taux", getSql().Numeric(5, 2), taux == null ? null : Number(taux))
      .input("createdBy", getSql().VarChar, createdBy)
      .query(Caution.create);

    res.status(201).json({ id: result.recordset[0].id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCaution = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      numero,
      banqueId = null,
      nature,
      type,
      idMarche,
      numeroDossier = null,
      dateDelivrance = null,
      dateEcheance = null,
      montant,
      idFournisseur = null,
      origine,
      taux = null,
    } = req.body;

    if (!numero || !nature || !type || !idMarche || montant == null || !origine) {
      return res.status(400).json({
        error: "numero, nature, type, idMarche, montant and origine are required",
      });
    }

    if (!VALID_NATURE.includes(nature)) {
      return res.status(400).json({ error: "Invalid nature value" });
    }

    if (!VALID_TYPE.includes(type)) {
      return res.status(400).json({ error: "Invalid type value" });
    }

    if (!VALID_ORIGINE.includes(origine)) {
      return res.status(400).json({ error: "Invalid origine value" });
    }

    if (!isValidMontantPrecision(montant)) {
      return res.status(400).json({
        error: "montant must respect NUMERIC(15,3): max 12 integer digits and 3 decimals",
      });
    }

    const updatedBy = await resolveActor(req);

    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, id)
      .input("numero", getSql().VarChar, numero)
      .input("banqueId", getSql().Int, banqueId)
      .input("nature", getSql().VarChar, nature)
      .input("type", getSql().VarChar, type)
      .input("idMarche", getSql().Int, Number(idMarche))
      .input("numeroDossier", getSql().VarChar, numeroDossier)
      .input("dateDelivrance", getSql().Date, dateDelivrance)
      .input("dateEcheance", getSql().Date, dateEcheance)
      .input("montant", getSql().Numeric(15, 3), Number(montant))
      .input("idFournisseur", getSql().Int, idFournisseur)
      .input("origine", getSql().VarChar, origine)
      .input("taux", getSql().Numeric(5, 2), taux == null ? null : Number(taux))
      .input("updatedBy", getSql().VarChar, updatedBy)
      .query(Caution.update);

    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
