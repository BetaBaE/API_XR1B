const { getConnection, getSql } = require("../database/connection");
const { factureDevise } = require("../database/factureDeviseQuery");

exports.getFactureDeviseCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(factureDevise.getCount);

    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    console.error("Error getting invoice count:", error.message);
    res.status(500).send(error.message);
  }
};

exports.getFacturesDevise = async (req, res) => {
  try {
    const {
      range = "[0,9]",
      sort = '["id", "ASC"]',
      filter = "{}",
    } = req.query;

    const [rangeStart, rangeEnd] = JSON.parse(range);
    const [sortField, sortOrder] = JSON.parse(sort);
    const filters = JSON.parse(filter);
    console.log(filters);

    let queryFilter = "";
    if (filters.Devise) {
      queryFilter += ` AND Devise = '${filters.Devise}'`;
    }
    if (filters.Redacteur) {
      queryFilter += ` AND fd.[Redacteur] LIKE '%${filters.Redacteur}%'`;
    }
    if (filters.NumDossier) {
      queryFilter += ` AND d.NumDossier  LIKE '%${filters.NumDossier}%'`;
    }
    if (filters.nom) {
      queryFilter += ` AND f.nom LIKE '%${filters.nom}%'`;
    }
    if (filters.numDoc) {
      queryFilter += ` AND numDoc LIKE '%${filters.numDoc}%'`;
    }
    if (filters.codeChantier) {
      queryFilter += ` AND codeChantier LIKE '%${filters.codeChantier}%'`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(
      `${factureDevise.getAll} 
       ${queryFilter} 
       ORDER BY ${sortField} ${sortOrder}
       OFFSET ${rangeStart} ROWS 
       FETCH NEXT ${rangeEnd + 1 - rangeStart} ROWS ONLY`
    );

    res.set("Content-Range", `factures ${rangeStart}-${rangeEnd}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    res.status(500).send(error.message);
  }
};

exports.createFactureDevise = async (req, res) => {
  try {
    const {
      idDossier,
      Devise,
      MontantHtDevise,
      MontantTvaDevise,
      MontantTTCDevise,
      TauxInit,
      iddesignation,
      idFournisseur,
      dateDoc,
      numDoc,
      codeChantier,
      Redacteur,
      dateDouane,
    } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("idDossier", getSql().Int, idDossier)
      .input("Devise", getSql().VarChar, Devise)
      .input("MontantHtDevise", getSql().Numeric(38, 6), MontantHtDevise)
      .input("MontantTvaDevise", getSql().Numeric(38, 6), MontantTvaDevise)
      .input("MontantTTCDevise", getSql().Numeric(38, 6), MontantTTCDevise)
      .input("TauxInit", getSql().Numeric(6, 3), TauxInit)
      .input("MontantHtDh", getSql().Numeric(38, 6), MontantHtDevise * TauxInit)
      .input(
        "MontantTvaDh",
        getSql().Numeric(38, 6),
        MontantTvaDevise * TauxInit
      )
      .input(
        "MontantTTCDh",
        getSql().Numeric(38, 6),
        MontantTTCDevise * TauxInit
      )
      .input("iddesignation", getSql().Int, iddesignation)
      .input("idFournisseur", getSql().Int, idFournisseur)
      .input("dateDoc", getSql().Date, dateDoc)
      .input("numDoc", getSql().VarChar, numDoc)
      .input("codeChantier", getSql().VarChar, codeChantier)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("dateDouane", getSql().Date, dateDouane)
      .query(factureDevise.create);

    res.status(201).json({
      id: "",
      ...req.body,
      dateCreation: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    res.status(500).send(error.message);
  }
};

exports.updateFactureDevise = async (req, res) => {
  try {
    const {
      idDossier,
      Devise,
      MontantHtDevise,
      MontantTvaDevise,
      MontantTTCDevise,
      MontantPreparation,
      CumulPaiementDevise,
      TauxInit,
      iddesignation,
      idFournisseur,
      dateDoc,
      numDoc,
      codeChantier,
      dateDouane,
      redacteur,
    } = req.body;
    console.log(req.body);

    // Validate required fields
    if (
      !idDossier ||
      !Devise ||
      !redacteur ||
      !iddesignation ||
      !idFournisseur
    ) {
      return res.status(400).json({
        error:
          "Required fields (idDossier, Devise, iddesignation, idFournisseur, ModifierPar) are missing",
      });
    }

    // Validate numeric fields
    // if (isNaN((MontantHtDevise)) {
    //   return res.status(400).json({ error: "MontantHtDevise must be a valid number" });
    // }

    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("idDossier", getSql().Int, idDossier)
      .input("Devise", getSql().VarChar, Devise)
      .input("MontantHtDevise", getSql().Numeric(38, 6), MontantHtDevise)
      .input("MontantTvaDevise", getSql().Numeric(38, 6), MontantTvaDevise || 0)
      .input("MontantTTCDevise", getSql().Numeric(38, 6), MontantTTCDevise || 0)
      .input(
        "MontantPreparation",
        getSql().Numeric(38, 6),
        MontantPreparation || 0
      )
      .input(
        "CumulPaiementDevise",
        getSql().Numeric(38, 6),
        CumulPaiementDevise || 0
      )
      .input("TauxInit", getSql().Numeric(6, 3), TauxInit || 0)
      .input(
        "MontantHtDh",
        getSql().Numeric(38, 6),
        MontantHtDevise * TauxInit || 0
      )
      .input(
        "MontantTvaDh",
        getSql().Numeric(38, 6),
        MontantTvaDevise * TauxInit || 0
      )
      .input(
        "MontantTTCDh",
        getSql().Numeric(38, 6),
        MontantTTCDevise * TauxInit || 0
      )
      .input("iddesignation", getSql().Int, iddesignation)
      .input("idFournisseur", getSql().Int, idFournisseur)
      .input("dateDoc", getSql().DateTime, dateDoc || null)
      .input("numDoc", getSql().VarChar, numDoc || null)
      .input("codeChantier", getSql().VarChar, codeChantier || null)
      .input("dateDouane", getSql().DateTime, dateDouane || null)
      .input("ModifierPar", getSql().VarChar, redacteur)
      .query(factureDevise.update);

    res.json({
      id: req.params.id,
      ...req.body,
      dateModification: new Date().toISOString(),
      message: "Invoice updated successfully",
    });
  } catch (error) {
    console.error("Error updating invoice:", error.message);
    res.status(500).json({
      error: "Failed to update invoice",
      details: error.message,
    });
  }
};

exports.getOneFactureDevise = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factureDevise.getOne);

    if (!result.recordset[0]) {
      return res.status(404).send("Invoice not found");
    }

    res.set("Content-Range", `factures 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching invoice:", error.message);
    res.status(500).send(error.message);
  }
};

exports.getFacturesByDossier = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("idDossier", getSql().Int, req.params.idDossier)
      .query(factureDevise.getByDossierId);

    res.set(
      "Content-Range",
      `factures 0-${result.recordset.length}/${result.recordset.length}`
    );
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching invoices by dossier:", error.message);
    res.status(500).send(error.message);
  }
};
