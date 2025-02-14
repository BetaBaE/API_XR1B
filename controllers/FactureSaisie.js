const { getConnection, getSql } = require("../database/connection");
const { factureSaisie } = require("../database/FactureSaisieQuery");

// Middleware pour obtenir le nombre de factures
exports.getfactureSaisieCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    let filter = req.query.filter || "{}";
    filter = JSON.parse(filter);
    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` AND upper(BonCommande) LIKE ('%${filter.BonCommande}%')`;
    }

    const result = await pool
      .request()
      .query(`${factureSaisie.getfactureSaisiecount} ${queryFilter}`);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
};

// Obtenir les factures avec pagination et filtrage
exports.getfactureSaisie = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` AND upper(BonCommande) LIKE ('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` AND upper(fou.nom) LIKE (upper('%${filter.fournisseur}%'))`;
    }
    if (filter.fullname) {
      queryFilter += ` AND upper(fullname) LIKE (upper('%${filter.fullname}%'))`;
    }
    if (filter.designation) {
      queryFilter += ` AND upper(d.designation) LIKE (upper('%${filter.designation}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` AND upper(numeroFacture) LIKE ('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` AND upper(fou.CodeFournisseur) LIKE (upper('%${filter.CodeFournisseur}%'))`;
    }
    if (filter.Datedebut && filter.Datefin) {
      queryFilter += ` AND DateFacture BETWEEN '${filter.Datedebut}' AND '${filter.Datefin}'`;
    }
    if (filter.Datedebut) {
      queryFilter += ` AND DateFacture > '${filter.Datedebut}'`;
    }
    if (filter.Datefin) {
      queryFilter += ` AND DateFacture < '${filter.Datefin}'`;
    }
    if (filter.LIBELLE) {
      queryFilter += ` AND upper(ch.LIBELLE) LIKE (upper('%${filter.LIBELLE}%'))`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(
      `${factureSaisie.getfactureSaisie} ${queryFilter} ORDER BY ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `factures ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtenir une facture par ID
exports.getfactureSaisieById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(factureSaisie.getOne);

    res.set("Content-Range", `factures 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Créer une nouvelle facture
exports.createfacture = async (req, res) => {
  const {
    numeroFacture,
    BonCommande,
    TTC,
    fullName,
    fournisseur,
    codechantier,
    DateFacture,
    iddesignation,
    dateecheance,
    CatFn,
    EtatIR,
  } = req.body;

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("numeroFacture", getSql().VarChar, req.body.numeroFacture)
      .input("TTC", getSql().Numeric(10, 2), req.body.TTC)
      .input("BonCommande", getSql().VarChar, req.body.BonCommande)
      .input("DateFacture", getSql().Date, req.body.DateFacture)
      .input("idfournisseur", getSql().Int, req.body.idfournisseur)
      .input("fullName", getSql().VarChar, req.body.fullName)
      .input("iddesignation", getSql().Int, req.body.iddesignation)
      .input("codechantier", getSql().VarChar, req.body.codechantier)
      .input("dateecheance", getSql().VarChar, req.body.dateecheance)
      .input("CatFn", getSql().VarChar, req.body.CatFn)
      .input("EtatIR", getSql().VarChar, req.body.EtatIR)
      .query(factureSaisie.createfacture);

    res.json({
      id: "",
      numeroFacture,
      BonCommande,
      TTC,
      fournisseur,
      codechantier,
      DateFacture,
      fullName,
      iddesignation,
      dateecheance,
      CatFn,
    });
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
};

// Mettre à jour une facture
exports.updatefactureSaisie = async (req, res) => {
  const {
    numeroFacture,
    BonCommande,
    TTC,
    DateFacture,
    verifiyMidelt,
    codeChantier,
    dateecheance,
    CatFn,
    fullNameupdating,
    designation,
    etat,
    EtatIR,
  } = req.body;

  console.log(req.body);

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().VarChar, designation) // Utilisation du paramètre d'URL :id comme valeur pour le code de designation
      .query(`SELECT * FROM [dbo].[FactureDesignation] WHERE id = @id`);

    designationDetail = result.recordset[0];

    let TTCcalc =
      TTC / designationDetail.PourcentageTVA +
      (TTC - TTC / designationDetail.PourcentageTVA);

    const TTCValue = parseFloat(TTC);

    await pool
      .request()
      .input("numeroFacture", getSql().VarChar, numeroFacture)
      .input("BonCommande", getSql().VarChar, BonCommande)
      .input("TTC", getSql().Decimal(10, 2), TTCValue) // Ensure this is a number
      .input(
        "HT",
        getSql().Decimal(10, 2),
        TTCValue / designationDetail.PourcentageTVA
      ) // Keep as number
      .input(
        "MontantTVA",
        getSql().Decimal(10, 2),
        TTCValue - TTCValue / designationDetail.PourcentageTVA
      ) // Keep as number
      .input("DateFacture", getSql().DateTime, DateFacture)
      .input("verifiyMidelt", getSql().VarChar, verifiyMidelt)
      .input("fullNameupdating", getSql().VarChar, fullNameupdating)
      .input("iddesignation", getSql().Int, designation)
      .input("codechantier", getSql().VarChar, codeChantier)
      .input("dateecheance", getSql().Date, dateecheance)
      .input("CatFn", getSql().VarChar, CatFn)
      .input("etat", getSql().VarChar, etat)
      .input("EtatIR", getSql().VarChar, EtatIR)
      .input("id", getSql().Int, req.params.id)
      .query(factureSaisie.delete);

    console.log("after", {
      id: req.params.id,
      numeroFacture,
      BonCommande,
      TTC,
      DateFacture,
      verifiyMidelt,
      codeChantier,
      dateecheance,
      CatFn,
      fullNameupdating,
      designation,
    });

    res.json({
      id: req.params.id,
      numeroFacture,
      BonCommande,
      TTC,
      DateFacture,
      verifiyMidelt,
      codeChantier,
      dateecheance,
      CatFn,
      fullNameupdating,
      designation,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtenir des factures par nom de fournisseur
exports.getfacturebyfournisseur = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, req.params.nom)
      .query(factureSaisie.getfacturebyfournisseurnom);

    res.set("Content-Range", `virement 0-1/1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtenir l'historique des factures
exports.getfacturehistorique = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["chantier" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` AND upper(BonCommande) LIKE ('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` AND upper(fou.nom) LIKE (upper('%${filter.fournisseur}%'))`;
    }
    if (filter.fullname) {
      queryFilter += ` AND upper(fullname) LIKE (upper('%${filter.fullname}%'))`;
    }
    if (filter.designation) {
      queryFilter += ` AND upper(d.designation) LIKE (upper('%${filter.designation}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` AND upper(numeroFacture) LIKE ('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` AND upper(fou.CodeFournisseur) LIKE (upper('%${filter.CodeFournisseur}%'))`;
    }
    if (filter.Datedebut && filter.Datefin) {
      queryFilter += ` AND DateFacture BETWEEN '${filter.Datedebut}' AND '${filter.Datefin}'`;
    }
    if (filter.Datedebut) {
      queryFilter += ` AND DateFacture > '${filter.Datedebut}'`;
    }
    if (filter.Datefin) {
      queryFilter += ` AND DateFacture < '${filter.Datefin}'`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(
      `${factureSaisie.gethistoriquefacture} ${queryFilter} ORDER BY ${
        sort[0]
      } ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `Facture Supprimer ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtenir le nombre d'historique des factures
exports.getFacturehistoriqueCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(factureSaisie.gethistoriquefacturecount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
};

// Obtenir des factures par paiement fournisseur
exports.getfacturebyfournisseurpaiement = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factureSaisie.getfacturebyfournisseurpaiement);

    res.set("Content-Range", `factures 0-1/1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtenir le nombre de factures validées
exports.getFacturevaliderCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(factureSaisie.getcountvalider);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
};

// Obtenir les factures validées
exports.getfacturevalider = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` AND upper(BonCommande) LIKE ('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` AND upper(fou.nom) LIKE (upper('%${filter.fournisseur}%'))`;
    }
    if (filter.fullname) {
      queryFilter += ` AND upper(fullname) LIKE (upper('%${filter.fullname}%'))`;
    }
    if (filter.designation) {
      queryFilter += ` AND upper(d.designation) LIKE (upper('%${filter.designation}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` AND upper(numeroFacture) LIKE ('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` AND upper(fou.CodeFournisseur) LIKE (upper('%${filter.CodeFournisseur}%'))`;
    }
    if (filter.Datedebut && filter.Datefin) {
      queryFilter += ` AND DateFacture BETWEEN '${filter.Datedebut}' AND '${filter.Datefin}'`;
    }
    if (filter.Datedebut) {
      queryFilter += ` AND DateFacture > '${filter.Datedebut}'`;
    }
    if (filter.Datefin) {
      queryFilter += ` AND DateFacture < '${filter.Datefin}'`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(
      `${factureSaisie.getfacturevalider} ${queryFilter} ORDER BY ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `factures ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Mettre à jour une facture validée
exports.updatefacturevalider = async (req, res) => {
  const { verifiyMidelt, updatedBy, BonCommande, CatFn } = req.body;
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("verifiyMidelt", getSql().VarChar, req.body.verifiyMidelt)
      .input("BonCommande", getSql().VarChar, req.body.BonCommande)
      .input("updatedBy", getSql().VarChar, req.body.updatedBy)
      .input("CatFn", getSql().VarChar, req.body.CatFn)
      .query(factureSaisie.validerfacture);

    res.json({
      id: req.params.id,
      verifiyMidelt,
      BonCommande,
      updatedBy,
      CatFn,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtenir le total des factures par fournisseur sans fonction
exports.getsumfacturebyfournisseurwithoutfn = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factureSaisie.getsumfacturebyfournisseurwithoutfn);

    res.set("Content-Range", `factures 0-1/1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtenir le total des factures par fournisseur avec fonction
exports.getsumfacturebyfournisseurwithfn = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factureSaisie.getsumfacturebyfournisseurwithfn);

    res.set("Content-Range", `factures 0-1/1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
/*   lister les factures qui ont fiche Navette  et les  avances non payer  de 
de chaque fournisseur
*/
exports.getAvancesNonPayeesParFournisseurId = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factureSaisie.getAvancesNonPayeesParFournisseurId);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.checkFAcreation = async (req, res) => {
  let filter = req.query.filter || "{}";

  filter = JSON.parse(filter);
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("nfa", getSql().VarChar, filter.nfa)
      .input("fdate", getSql().Date, filter.fdate)
      .input("idf", getSql().Int, filter.idf)
      .query(factureSaisie.checkFAcreation);

    res.set("Content-Range", `factures 0-3/4`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
