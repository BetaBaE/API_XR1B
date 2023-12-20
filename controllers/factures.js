const { getConnection, getSql } = require("../database/connection");
const { factures } = require("../database/querys");

const idGenerator = async (TableId) => {
  // Function to generate an ID by concatenating multiple data elements
  // 1. TableId, for example: FA, AV, FN
  // 2. Last two digits from the current year (e.g., for the year 2023, use '23')
  // 3. The count of rows in the current year plus 1. The ID should have six digits like: 000001, 000015, 000100. The number changes based on the count.
  // The generated ID format: TableId + LastTwoDigitsOfYear + FormattedNumber

  // Initialize the query string with a generic Select Count(*) statement

  let query = "select MAX(id) as max from ";

  // Switch statement to determine the table name based on the TableId
  switch (TableId) {
    case "FA":
      // If TableId is "FA", append the table name "CMT_Facture" to the query
      query = query + "CMT_Facture";
      break;
    case "AV":
      // If TableId is "AV", append the table name "CMT_Avance" to the query
      query = query + "CMT_Avance";
      break;

    case "FN":
      // If TableId is "FN", append the table name "CMT_FicheNavette" to the query
      query = query + "CMT_FicheNavette";
      break;

    /* ... */

    default:
      // If TableId doesn't match any of the specified cases, return an error message
      return "Table Id Not Found";
  }
  let count = 0;
  try {
    const pool = await getConnection();

    const result = await pool.request().query(query);

    count = result.recordset[0].max;
  } catch (error) {
    console.log(error.message);
  }

  const paddedLength = 6; // Define the desired length for the formatted number
  console.log(count);
  let yearDb = +count.slice(2, 4);
  let currentCountDb = +count.slice(4, count.length);

  // Get the current year
  const currentDate = new Date();
  const year = currentDate.getFullYear();

  // Extract the last two digits of the current year
  const lastTwoDigits = year % 100;

  if (lastTwoDigits == yearDb) {
    currentCountDb++;
  } else {
    currentCountDb = 1;
  }
  // Pad the 'Count' with leading zeros to ensure it meets the specified length
  const formattedNumber = String(currentCountDb).padStart(
    Math.max(paddedLength, String(currentCountDb).length),
    "0"
  );

  // Concatenate the TableId, last two digits of the year, and the formatted number to create the final ID
  let id = `${TableId}${lastTwoDigits}${formattedNumber}`;
  console.log(query);
  return id; // Return the generated ID
};

exports.getFacturesCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(factures.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFactures = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.NumeroFacture) {
      queryFilter += ` and upper(NumeroFacture) like(upper('%${filter.NumeroFacture}%'))`;
    }
    if (filter.BonCommande) {
      queryFilter += ` and BonCommande like('%${filter.BonCommande}%')`;
    }

    console.log(queryFilter);
    const pool = await getConnection();

    const result = await pool.request().query(
      `${factures.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `factures ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getFacturesById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(factures.getOne);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(factures.getAllFactures);

    res.set("Content-Range", `factures 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.createfacture = async (req, res) => {
  const {
    NumeroFacture,
    BonCommande,
    IdFournisseur,
    DateFacture,
    DateEcheance,
    ReferenceAvanace,
    MontantHT,
    MontantTVA,
    MontantTTC,
    Redacteur,
    VerifiyMidelt,
    IdDesignation,
    Chantier,
    NetAPayer,
    Etat,
  } = req.body;
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().VarChar, await idGenerator("FA"))
      .input(
        "NumeroFacture",
        getSql().VarChar,
        new String(req.body.NumeroFacture)
      )
      .input("BonCommande", getSql().VarChar, new String(req.body.BonCommande))
      .input("IdFournisseur", getSql().Int, new String(req.body.IdFournisseur))
      .input("DateFacture", getSql().DateTime, new String(req.body.DateFacture))
      .input(
        "DateEcheance",
        getSql().DateTime,
        new String(req.body.DateEcheance)
      )
      .input(
        "ReferenceAvanace",
        getSql().VarChar,
        new String(req.body.ReferenceAvanace)
      )
      .input("MontantHT", getSql().Numeric(10, 3), req.body.MontantHT)
      .input("MontantTVA", getSql().Numeric(10, 3), req.body.MontantHT)
      .input("MontantTTC", getSql().Numeric(10, 3), req.body.MontantTTC)
      .input("Redacteur", getSql().VarChar, req.body.Redacteur)
      .input("VerifiyMidelt", getSql().VarChar, req.body.VerifiyMidelt)
      .input("IdDesignation", getSql().Int, req.body.IdDesignation)
      .input("Chantier", getSql().VarChar, req.body.Chantier)
      .input("NetAPayer", getSql().Numeric(10, 3), req.body.NetAPayer)
      .input("Etat", getSql().VarChar, req.body.Etat)
      .input(
        "codechantier",
        getSql().VarChar,
        new String(req.body.codechantier)
      )
      .query(factures.createfacture);
    console.log("errour");
    res.json({
      id: "",
      NumeroFacture,
      BonCommande,
      IdFournisseur,
      DateFacture,
      DateEcheance,
      ReferenceAvanace,
      MontantHT,
      MontantTVA,
      MontantTTC,
      Redacteur,
      MontantTTC,
      VerifiyMidelt,
      IdDesignation,
      Chantier,
      NetAPayer,
      Etat,
    });
  } catch (error) {
    // switch (error.originalError.info.number) {
    //   case 547:
    //     error.message = "date invalid";
    //     break;
    //   case 2627:
    //     error.message = "déja existe";
    //     break;
    // }

    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};

exports.updateFacture = async (req, res) => {
  const {
    NumeroFacture,
    BonCommande,
    IdFournisseur,
    DateFacture,
    DateEcheance,
    ReferenceAvanace,
    MontantHT,
    MontantTVA,
    MontantTTC,
    Redacteur,
    VerifiyMidelt,
    IdDesignation,
    Chantier,
    NetAPayer,
    Etat,
  } = req.body;
  if (
    NumeroFacture == null ||
    BonCommande == null ||
    IdFournisseur == null ||
    DateFacture == null ||
    DateEcheance == null ||
    ReferenceAvanace == null ||
    MontantHT == null ||
    MontantTVA == null ||
    MontantTTC == null ||
    Redacteur == null ||
    VerifiyMidelt == null ||
    IdDesignation == null ||
    Chantier == null ||
    NetAPayer == null ||
    Etat == null
  ) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("NumeroFacture", getSql().VarChar, NumeroFacture)
      .input("BonCommande", getSql().VarChar, BonCommande)
      .input("IdFournisseur", getSql().Int, IdFournisseur)
      .input("DateFacture", getSql().DateTime, DateFacture)
      .input("DateEcheance", getSql().DateTime, DateEcheance)
      .input("ReferenceAvanace", getSql().VarChar, ReferenceAvanace)
      .input("MontantHT", getSql().Numeric, MontantHT)
      .input("MontantTVA", getSql().Numeric, MontantTVA)
      .input("MontantTTC", getSql().Numeric, MontantTTC)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("VerifiyMidelt", getSql().VarChar, VerifiyMidelt)
      .input("IdDesignation", getSql().Int, IdDesignation)
      .input("Chantier", getSql().VarChar, Chantier)
      .input("NetAPayer", getSql().Numeric, NetAPayer)
      .input("Etat", getSql().VarChar, Etat)
      .input("id", getSql().Int, req.params.id)
      .query(factures.updateFacture);

    res.json({
      NumeroFacture,
      BonCommande,
      IdFournisseur,
      DateFacture,
      DateEcheance,
      ReferenceAvanace,
      MontantHT,
      MontantTVA,
      MontantTTC,
      Redacteur,
      VerifiyMidelt,
      IdDesignation,
      Chantier,
      NetAPayer,
      Etat,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getfacturebyfournisseurid = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factures.getfacturebyfournisseurid);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
