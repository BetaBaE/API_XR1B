const { getConnection, getSql } = require("../database/connection");
const { Avance } = require("../database/querys");

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

// console.log(idGenerator("FA", 10052));

exports.getAvanceCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Avance.getAvancesCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getAvanceById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(Avance.getOneAvance);

    res.set("Content-Range", `Avance 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getAllAvances = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande) like(upper('%${filter.BonCommande}%'))`;
    }
    if (filter.Chantier) {
      queryFilter += ` and upper(Chantier) like('%${filter.Chantier}%')`;
    }
    if (filter.Etat) {
      queryFilter += ` and upper(Etat) like('%${filter.Etat}%')`;
    }
    console.log(queryFilter);
    const pool = await getConnection();

    const result = await pool.request().query(
      `${Avance.getAllAvances} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `avances ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createAvances = async (req, res) => {
  const {
    BonCommande,
    MontantAvance,
    MontantTotal,
    DocumentReference,
    DateDocumentReference,
    IdFournisseur,
    Redacteur,
    DateAvance,
    NombreDeParties,
    Chantier,
    Restituer,
  } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("id", getSql().VarChar, await idGenerator("AV"))
      .input("BonCommande", getSql().VarChar, BonCommande)
      .input("MontantAvance", getSql().Numeric, MontantAvance)
      .input("MontantTotal", getSql().Numeric, MontantTotal)
      .input("DocumentReference", getSql().VarChar, DocumentReference)
      .input("DateDocumentReference", getSql().DateTime, DateDocumentReference)
      .input("IdFournisseur", getSql().Int, IdFournisseur)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("DateAvance", getSql().DateTime, DateAvance)
      .input("NombreDeParties", getSql().Int, NombreDeParties)
      .input("Chantier", getSql().VarChar, Chantier)
      .input("Restituer", getSql().VarChar, Restituer)

      .query(Avance.createAvance);
    console.log("success");
    res.json({
      id: "",
      BonCommande,
      MontantAvance,
      MontantTotal,
      DocumentReference,
      DateDocumentReference,
      IdFournisseur,
      Redacteur,
      DateAvance,
      NombreDeParties,
      Chantier,
      Restituer,
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
    console.log(error);
  }
};

exports.updateAvances = async (req, res) => {
  const {
    BonCommande,
    MontantAvance,
    MontantTotal,
    DocumentReference,
    DateDocumentReference,
    IdFournisseur,
    Redacteur,
    DateAvance,
    NombreDeParties,
    Chantier,
    Restituer,
  } = req.body;
  if (
    BonCommande == null ||
    MontantAvance == null ||
    MontantTotal == null ||
    DocumentReference == null ||
    DateDocumentReference == null ||
    IdFournisseur == null ||
    Redacteur == null ||
    DateAvance == null ||
    NombreDeParties == null ||
    Chantier == null ||
    Restituer == null
  ) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("BonCommande", getSql().VarChar, BonCommande)
      .input("MontantAvance", getSql().Numeric, MontantAvance)
      .input("MontantTotal", getSql().Numeric, MontantTotal)
      .input("DocumentReference", getSql().VarChar, DocumentReference)
      .input("DateDocumentReference", getSql().DateTime, DateDocumentReference)
      .input("IdFournisseur", getSql().VarChar, IdFournisseur)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("DateAvance", getSql().DateTime, DateAvance)
      .input("NombreDeParties", getSql().Int, NombreDeParties)
      .input("Chantier", getSql().VarChar, Chantier)
      .input("Restituer", getSql().VarChar, Restituer)
      .input("id", getSql().Int, req.params.id)
      .query(Avance.updateAvance);

    res.json({
      BonCommande,
      MontantAvance,
      MontantTotal,
      DocumentReference,
      DateDocumentReference,
      IdFournisseur,
      Redacteur,
      DateAvance,
      NombreDeParties,
      Chantier,
      NombreDeParties,
      Restituer,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
