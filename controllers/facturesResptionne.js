const { getConnection, getSql } = require("../database/connection");
const { factureSaisie } = require("../database/querys");

exports.getfactureSaisieCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(factureSaisie.getfactureSaisiecount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getfactureSaisie = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande)  like('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.fournisseur}%'))`;
    }
    if (filter.fullname) {
      queryFilter += ` and upper(fullname) like(upper('%${filter.fullname}%'))`;
    }

    if (filter.designation) {
      queryFilter += ` and upper(d.designation) like(upper('%${filter.designation}%'))`;
    }

    if (filter.numeroFacture) {
      queryFilter += ` and upper(numeroFacture)  like('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(fou.CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
    }

    if (filter.Datedebut && filter.Datefin) {
      queryFilter += ` and DateFacture between '${filter.Datedebut}' and  '${filter.Datefin}' `;
    }
    if (filter.Datedebut) {
      queryFilter += ` and DateFacture > '${filter.Datedebut}'`;
    }
    if (filter.Datefin) {
      queryFilter += ` and DateFacture < '${filter.Datefin}'`;
    }
    if (filter.LIBELLE) {
      queryFilter += ` and upper(ch.LIBELLE) like(upper('%${filter.LIBELLE}%'))`;
    }
    console.log(queryFilter);
    const pool = await getConnection();

    const result = await pool.request().query(
      `${factureSaisie.getfactureSaisie} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
    OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `facturesresptionne ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

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
    res.send(error.message);
    res.status(500);
  }
};
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
  } = req.body;
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("numeroFacture", getSql().Char, new String(req.body.numeroFacture))
      .input("TTC", getSql().Numeric(10, 2), req.body.TTC)
      .input("BonCommande", getSql().Char, new String(req.body.BonCommande))
      .input("DateFacture", getSql().Date, req.body.DateFacture)
      .input("idfournisseur", getSql().Int, req.body.idfournisseur)
      .input("fullName", getSql().VarChar, req.body.fullName)
      .input("iddesignation", getSql().Int, req.body.iddesignation)
      .input(
        "codechantier",
        getSql().VarChar,
        new String(req.body.codechantier)
      )
      .input("dateEcheance", getSql().VarChar, req.body.dateEcheance)
      .query(factureSaisie.createfacture);
    console.log("errour");
    res.json({
      id: "",
      numeroFacture,
      BonCommande,
      TTC,
      fournisseur,
      codechantier,
      DateFacture,
      fullName,
      codechantier,
      iddesignation,
    });
  } catch (error) {
    switch (error.originalError.info.number) {
      case 547:
        error.message = "date invalid";
        break;
      case 2627:
        error.message = "déja existe";
        break;
    }

    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};

exports.updatefactureSaisie = async (req, res) => {
  const { numeroFacture } = req.body;
  try {
    const pool = await getConnection();

    await pool
      .request()

      .input("id", getSql().Int, req.params.id)

      .query(factureSaisie.delete);

    res.json({
      id: req.params.id,
      numeroFacture,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
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
    res.send(error.message);
    res.status(500);
  }
};
exports.getfacturehistorique = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["chantier" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande)  like('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.fournisseur}%'))`;
    }
    if (filter.fullname) {
      queryFilter += ` and upper(fullname) like(upper('%${filter.fullname}%'))`;
    }

    if (filter.designation) {
      queryFilter += ` and upper(d.designation) like(upper('%${filter.designation}%'))`;
    }

    if (filter.numeroFacture) {
      queryFilter += ` and upper(numeroFacture)  like('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(fou.CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
    }

    if (filter.Datedebut && filter.Datefin) {
      queryFilter += ` and DateFacture between '${filter.Datedebut}' and  '${filter.Datefin}' `;
    }
    if (filter.Datedebut) {
      queryFilter += ` and DateFacture > '${filter.Datedebut}'`;
    }
    if (filter.Datefin) {
      queryFilter += ` and DateFacture < '${filter.Datefin}'`;
    }

    console.log(queryFilter);
    const pool = await getConnection();
    // const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    const result = await pool.request().query(
      `${factureSaisie.gethistoriquefacture} ${queryFilter} Order by ${
        sort[0]
      } ${sort[1]}
    OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `Facture Supprimer ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
exports.getFacturehistoriqueCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(factureSaisie.gethistoriquefacturecount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
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
    res.send(error.message);
    res.status(500);
  }
};
exports.getFacturevaliderCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(factureSaisie.getcountvalider);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
exports.getfacturevalider = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande)  like('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.fournisseur}%'))`;
    }
    if (filter.fullname) {
      queryFilter += ` and upper(fullname) like(upper('%${filter.fullname}%'))`;
    }

    if (filter.designation) {
      queryFilter += ` and upper(d.designation) like(upper('%${filter.designation}%'))`;
    }

    if (filter.numeroFacture) {
      queryFilter += ` and upper(numeroFacture)  like('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(fou.CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
    }

    if (filter.Datedebut && filter.Datefin) {
      queryFilter += ` and DateFacture between '${filter.Datedebut}' and  '${filter.Datefin}' `;
    }
    if (filter.Datedebut) {
      queryFilter += ` and DateFacture > '${filter.Datedebut}'`;
    }
    if (filter.Datefin) {
      queryFilter += ` and DateFacture < '${filter.Datefin}'`;
    }

    console.log(queryFilter);
    const pool = await getConnection();
    // const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    const result = await pool.request().query(
      `${factureSaisie.getfacturevalider} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
    OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `facturesresptionne ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
exports.updatefacturevalider = async (req, res) => {
  const { verifiyMidelt, updatedBy, BonCommande } = req.body;
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("verifiyMidelt", getSql().VarChar, req.body.verifiyMidelt)
      .input("BonCommande", getSql().VarChar, req.body.BonCommande)
      .input("updatedBy", getSql().VarChar, req.body.updatedBy)
      .query(factureSaisie.validerfacture);
    res.json({
      id: req.params.id,
      verifiyMidelt,
      BonCommande,
      updatedBy,
    });
  } catch (error) {
    /*      //error.originalError.info.name="déja existe"
         if(error.originalError.info.number=2627) {
         //  error.originalError.info.name="déja existe"
           error.message="déja supprimé"
           res.set( error.originalError.info.name)
          }*/

    res.status(500);
    res.send(error.message);
  }
};

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
    res.send(error.message);
    res.status(500);
  }
};

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
    res.send(error.message);
    res.status(500);
  }
};
