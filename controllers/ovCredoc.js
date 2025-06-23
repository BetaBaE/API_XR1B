const { getConnection, getSql } = require("../database/connection");
const { ovCredoc } = require("../database/ovcredoc");

async function generateNewId() {
  const pool = await getConnection();
  const result = await pool.request().query(ovCredoc.getNextId);

  const currentYear = new Date().getFullYear();
  const nextId = result.recordset[0]?.nextId || 1;

  // Determine padding length: at least 4 digits, or longer if needed
  const paddedId = nextId.toString().padStart(4, "0");

  return `OVC-${currentYear}-${paddedId}`;
}

exports.getOVCredocCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ovCredoc.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getOVCredocs = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.TypePaiement) {
      queryFilter += ` and TypePaiement like('%${filter.TypePaiement}%')`;
    }
    if (filter.etat) {
      queryFilter += ` and etat like('%${filter.etat}%')`;
    }
    if (filter.Devise) {
      queryFilter += ` and Devise like('%${filter.Devise}%')`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(
      `${ovCredoc.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `ovCredoc ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createOVCredoc = async (req, res) => {
  const {
    TypePaiement,
    ribAtner,
    dateEcheance,
    joursEcheance,
    etat,
    totalDevise,
    Devise,
    Redacteur,
  } = req.body;

  try {
    const pool = await getConnection();
    const newId = await generateNewId();

    await pool
      .request()
      .input("id", getSql().VarChar, newId)
      .input("TypePaiement", getSql().VarChar, TypePaiement)
      .input("ribAtner", getSql().Int, ribAtner)
      .input("dateEcheance", getSql().Date, dateEcheance)
      .input("joursEcheance", getSql().Int, joursEcheance)
      .input("etat", getSql().VarChar, etat || "En cours")
      .input("totalDevise", getSql().Decimal(18, 6), totalDevise || 0)
      .input("Devise", getSql().VarChar, Devise)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .query(ovCredoc.create);

    res.status(201).json({
      id: "",
      TypePaiement,
      ribAtner,
      dateEcheance,
      joursEcheance,
      etat: etat || "En cours",
      totalDevise: totalDevise || 0,
      Devise,
      Redacteur,
      dateCreation: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateOVCredoc = async (req, res) => {
  const {
    TypePaiement,
    ribAtner,
    dateEcheance,
    joursEcheance,
    etat,
    totalDevise,
    Devise,
    dateExecution,
    directeurSigne,
  } = req.body;

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("TypePaiement", getSql().VarChar, TypePaiement)
      .input("ribAtner", getSql().Int, ribAtner)
      .input("dateEcheance", getSql().Date, dateEcheance)
      .input("joursEcheance", getSql().Int, joursEcheance)
      .input("etat", getSql().VarChar, etat)
      .input("totalDevise", getSql().Decimal(18, 6), totalDevise)
      .input("Devise", getSql().VarChar, Devise)
      .input("dateExecution", getSql().DateTime, dateExecution)
      .input("directeurSigne", getSql().VarChar, directeurSigne)
      .input("id", getSql().VarChar, req.params.id)
      .query(ovCredoc.update);

    res.json({
      id: req.params.id,
      TypePaiement,
      ribAtner,
      dateEcheance,
      joursEcheance,
      etat,
      totalDevise,
      Devise,
      dateExecution,
      directeurSigne,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getOneOVCredoc = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(ovCredoc.getOne);

    if (result.recordset.length === 0) {
      return res.status(404).send("Payment order not found");
    }

    res.set("Content-Range", `ovCredoc 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getValidOVCredocs = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ovCredoc.getValid);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
