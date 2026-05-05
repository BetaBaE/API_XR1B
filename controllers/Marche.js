const { getConnection, getSql } = require("../database/connection");
const { Marche } = require("../database/MarcheQuery");

const ALLOWED_SORT_FIELDS = {
  id: "m.id",
  numero: "m.numero",
  codeAffaire: "c.CODEAFFAIRE",
  codeAffaireText: "c.CODEAFFAIRE",
  client: "m.client",
  montant: "m.montant",
  dateMES: "m.dateMES",
  statut: "m.statut",
  chantierLibelle: "c.LIBELLE",
  bankNom: "b.nom",
};

const VALID_STATUT = [
  "En cours",
  "Réceptionné PV",
  "Réceptionné DF",
  "Annulé",
  "Clôturé",
];

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

  if (filter.statut) {
    whereParts.push("AND m.statut = @statut");
    request.input("statut", getSql().VarChar, filter.statut);
  }

  if (filter.codeAffaire) {
    whereParts.push("AND c.CODEAFFAIRE LIKE @codeAffaire");
    request.input("codeAffaire", getSql().VarChar, `%${filter.codeAffaire}%`);
  }

  if (filter.client) {
    whereParts.push("AND m.client LIKE @client");
    request.input("client", getSql().VarChar, `%${filter.client}%`);
  }

  if (filter.numero) {
    whereParts.push("AND m.numero LIKE @numero");
    request.input("numero", getSql().VarChar, `%${filter.numero}%`);
  }

  if (filter.natissementBankId) {
    whereParts.push("AND m.natissementBankId = @natissementBankId");
    request.input(
      "natissementBankId",
      getSql().Int,
      Number(filter.natissementBankId)
    );
  }

  return whereParts.join(" ");
};

exports.getMarcheCount = async (req, res, next) => {
  try {
    const { filter } = parseListParams(req);
    const pool = await getConnection();
    const request = pool.request();
    const whereClause = applyFilterInputs(request, filter);
    const result = await request.query(`${Marche.getCount} ${whereClause}`);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMarche = async (req, res) => {
  try {
    const { range, sort, filter } = parseListParams(req);

    const sortField = ALLOWED_SORT_FIELDS[sort[0]] || "m.id";
    const sortOrder = String(sort[1]).toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pageSize = range[1] + 1 - range[0];

    const pool = await getConnection();
    const request = pool.request();
    const whereClause = applyFilterInputs(request, filter);
    request.input("offset", getSql().Int, range[0]);
    request.input("limit", getSql().Int, pageSize);

    const result = await request.query(
      `${Marche.getAll} ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
    );

    res.set("Content-Range", `marche ${range[0]}-${range[1]}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMarcheById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, Number(req.params.id))
      .query(Marche.getOne);

    res.set("Content-Range", "marche 0-0/1");
    res.json(result.recordset[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMarche = async (req, res) => {
  try {
    const {
      numero,
      codeAffaire,
      objet = null,
      partenaire = null,
      client,
      montant,
      natissementBankId = null,
      dateMES,
      delai = null,
      bailleur = null,
      statut = "En cours",
      dateRP = null,
      PV_RP = null,
      dateRD = null,
      PV_RD = null,
      tauxTva = 1.2,
      createdBy = null,
    } = req.body;

    if (!numero || !codeAffaire || !client || montant == null || !dateMES) {
      return res.status(400).json({
        error: "numero, codeAffaire, client, montant and dateMES are required",
      });
    }
    if (!isValidMontantPrecision(montant)) {
      return res.status(400).json({
        error: "montant must respect NUMERIC(15,3): max 12 integer digits and 3 decimals",
      });
    }

    if (!VALID_STATUT.includes(statut)) {
      return res.status(400).json({ error: "Invalid statut value" });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numero", getSql().VarChar, numero)
      .input("codeAffaire", getSql().VarChar, codeAffaire)
      .input("objet", getSql().VarChar, objet)
      .input("partenaire", getSql().VarChar, partenaire)
      .input("client", getSql().VarChar, client)
      .input("montant", getSql().Numeric(15, 3), Number(montant))
      .input("natissementBankId", getSql().Int, natissementBankId)
      .input("dateMES", getSql().Date, dateMES)
      .input("delai", getSql().Int, delai)
      .input("bailleur", getSql().VarChar, bailleur)
      .input("statut", getSql().VarChar, statut)
      .input("dateRP", getSql().Date, dateRP)
      .input("PV_RP", getSql().VarChar, PV_RP)
      .input("dateRD", getSql().Date, dateRD)
      .input("PV_RD", getSql().VarChar, PV_RD)
      .input("tauxTva", getSql().Numeric(5, 2), Number(tauxTva))
      .input("createdBy", getSql().VarChar, createdBy)
      .query(Marche.create);

    res.status(201).json({ id: result.recordset[0].id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMarche = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      numero,
      codeAffaire,
      objet = null,
      partenaire = null,
      client,
      montant,
      natissementBankId = null,
      dateMES,
      delai = null,
      bailleur = null,
      statut = "En cours",
      dateRP = null,
      PV_RP = null,
      dateRD = null,
      PV_RD = null,
      tauxTva = 1.2,
      updatedBy = null,
    } = req.body;

    if (!numero || !codeAffaire || !client || montant == null || !dateMES) {
      return res.status(400).json({
        error: "numero, codeAffaire, client, montant and dateMES are required",
      });
    }
    if (!isValidMontantPrecision(montant)) {
      return res.status(400).json({
        error: "montant must respect NUMERIC(15,3): max 12 integer digits and 3 decimals",
      });
    }

    if (!VALID_STATUT.includes(statut)) {
      return res.status(400).json({ error: "Invalid statut value" });
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, id)
      .input("numero", getSql().VarChar, numero)
      .input("codeAffaire", getSql().VarChar, codeAffaire)
      .input("objet", getSql().VarChar, objet)
      .input("partenaire", getSql().VarChar, partenaire)
      .input("client", getSql().VarChar, client)
      .input("montant", getSql().Numeric(15, 3), Number(montant))
      .input("natissementBankId", getSql().Int, natissementBankId)
      .input("dateMES", getSql().Date, dateMES)
      .input("delai", getSql().Int, delai)
      .input("bailleur", getSql().VarChar, bailleur)
      .input("statut", getSql().VarChar, statut)
      .input("dateRP", getSql().Date, dateRP)
      .input("PV_RP", getSql().VarChar, PV_RP)
      .input("dateRD", getSql().Date, dateRD)
      .input("PV_RD", getSql().VarChar, PV_RD)
      .input("tauxTva", getSql().Numeric(5, 2), Number(tauxTva))
      .input("updatedBy", getSql().VarChar, updatedBy)
      .query(Marche.update);

    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

