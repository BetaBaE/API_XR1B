const { getConnection, getSql } = require("../database/connection");
const { factureFicheNavette, factures } = require("../database/querys");

exports.getFactureCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(factureFicheNavette.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFacture = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["dateFacture" , "desc"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    console.log(filter);
    let queryFilter = "";

    if (filter.ficheNavette) {
      queryFilter += ` and upper(fich.ficheNavette) like(upper('%${filter.ficheNavette}%'))`;
    }
    if (filter.chantier) {
      queryFilter += ` and upper(fich.LIBELLE) like(upper('%${filter.chantier}%'))`;
    }

    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande)  like('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(nom) like(upper('%${filter.fournisseur}%'))`;
    }
    if (filter.source) {
      queryFilter += ` and upper(source) like(upper('%${filter.source}%'))`;
    }
    if (filter.designation) {
      queryFilter += ` and upper(designation) like(upper('%${filter.designation}%'))`;
    }

    if (filter.numeroFacture) {
      queryFilter += ` and upper(numeroFacture)  like('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
    }

    console.log(queryFilter);

    const pool = await getConnection();

    const result = await pool.request().query(
      `${factureFicheNavette.get} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `facturefchantierfournisseur ${range[0]}-${range[1] + 1 - range[0]}/${
        req.count
      }`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};


exports.createfacture = async(req, res) => {
  const {
      codechantier,
      idFacture,
      ficheNavette,
      idfournisseur,
      montantAvance
  } = req.body;

  try {
      const pool = await getConnection();

      await pool
          .request()
          .input("codechantier", getSql().Char, new String(req.body.codechantier))
          .input("idFacture", getSql().Int, req.body.idFacture)
          .input("idfournisseur", getSql().Int, req.body.idfournisseur)
          .input("montantAvance", getSql().Numeric(10, 2), req.body.montantAvance)
          .input("ficheNavette", getSql().VarChar, req.body.ficheNavette)
          .input("Bcommande", getSql().VarChar, req.body.Bcommande)
          .query(factureFicheNavette.create);
      console.log("errour");
      res.json({
          id: "",
          codechantier,
          idFacture,
          ficheNavette,
          idfournisseur
      });
  } catch (error) {
      

      res.status(500);
      res.send(error.message);
  }

};

/*
exports.getFacturePaiement = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["datedoc" , "desc"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    console.log(filter);
    let queryFilter = "";



    if (filter.nom_chantier) {
      queryFilter += ` and upper(nom_chantier) like(upper('%${filter.nom_chantier}%'))`;
    }
    if (filter.code_facture) {
      queryFilter += ` and upper(code_facture) like(upper('%${filter.code_facture}%'))`;
    }
    if (filter.code_fiche_navette) {
      queryFilter += ` and upper(code_fiche_navette) like(upper('%${filter.code_fiche_navette}%'))`;
    }
    console.log(queryFilter);

    const pool = await getConnection();

    const result = await pool.request().query(
      `${ViewFacturChantierFournissuer.getFacturepaiement} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `facturefchantierfournisseur ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.json(result.recordset);
  }
};*/

exports.getfactureresById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(factureFicheNavette.getOne);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updatenavette = async (req, res) => {
  const { ficheNavette,idFacture,idfournisseur,codechantier } = req.body;
  try {
    const pool = await getConnection();

    await pool
      .request()

      .input("id", getSql().Int, req.params.id)
      .input("ficheNavette", getSql().VarChar, req.body.ficheNavette)
      .input("idFacture", getSql().Int, req.body.idFacture)
      .input("idfournisseur", getSql().Int, req.body.idfournisseur)
      .input("codechantier", getSql().VarChar, req.body.codechantier)
      .query(factureFicheNavette.update);

    res.json({
      id: req.params.id,
      ficheNavette,
      idFacture,
      idfournisseur,
      codechantier
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


exports.getficheNavetteByfournisseur = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(factures.getficheNavetebyfournisseur);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getavanceByfournisseur = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("idfournisseur", getSql().VarChar, req.params.idfournisseur)
      .query(factureFicheNavette.getavancebyfournisseur);

    if (result.recordset) {
      res.set("Content-Range", `factures 0-1/1`);
      res.json(result.recordset);
    } else {
      res.json([]); // Return an empty array if there are no results
    }
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
