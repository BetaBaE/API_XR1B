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
      queryFilter += ` and upper(fich.nom) like(upper('%${filter.fournisseur}%'))`;
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
    
    // Modifier la construction de la clause WHERE
    let whereClause = queryFilter ? `WHERE 1=1${queryFilter}` : "";
    const pool = await getConnection();
    const result = await pool.request().query(
      `${factureFicheNavette.get} ${whereClause} Order by ${sort[0]} ${sort[1]}
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

exports.createfacture = async (req, res) => {
  const {
    codechantier,
    idFacture,
    ficheNavette,
    idfournisseur,
    montantAvance
  } = req.body;

  try {
    const pool = await getConnection();

    // Vérification si la composition existe déjà dans la table daf_factureNavette
    const existingCompositionQuery = `SELECT * FROM daf_factureNavette WHERE codechantier = @codechantier AND ficheNavette = @ficheNavette AND Bcommande = @Bcommande and idfournisseur=0`;
    const existingCompositionResult = await pool
      .request()
      .input("codechantier", getSql().VarChar, req.body.codechantier)
      .input("ficheNavette", getSql().VarChar, req.body.ficheNavette)
      .input("Bcommande", getSql().VarChar, req.body.Bcommande)
      .query(existingCompositionQuery);

    if (existingCompositionResult.recordset.length > 0) {
      // La composition existe déjà, renvoyer une réponse d'erreur
      res.status(400).json({ message: "La composition existe déjà dans la table daf_factureNavette" });
    } else {
    
      const insertQuery = `
        INSERT INTO [dbo].[DAF_factureNavette]
        ([codechantier], [montantAvance], [idfournisseur], [idFacture], [ficheNavette], [Bcommande])
        VALUES (@codechantier, @montantAvance, @idfournisseur, @idFacture, @ficheNavette, @Bcommande)
      `;
      await pool
        .request()
        .input("codechantier", getSql().VarChar, req.body.codechantier)
        .input("montantAvance", getSql().Numeric, req.body.montantAvance)
        .input("idfournisseur", getSql().Int, req.body.idfournisseur)
        .input("idFacture", getSql().Int, req.body.idFacture)
        .input("ficheNavette", getSql().VarChar, req.body.ficheNavette)
        .input("Bcommande", getSql().VarChar, req.body.Bcommande)
        .query(insertQuery);

      res.json({
        id: "",
        codechantier,
        idFacture,
        ficheNavette,
        idfournisseur,
        montantAvance
      });
    }
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};



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
exports.getsumavancebyfournisseurwithfn = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factureFicheNavette.getsumavancebyforurnisseur);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.updatenavette = async (req, res) => {
  const { ficheNavette, idFacture, CODEAFFAIRE } = req.body;
  try {
    const pool = await getConnection();
    const updateFactureQuery = `
      UPDATE DAF_factureNavette
      SET ficheNavette = @ficheNavette ,
          idFacture=@idFacture
      WHERE idfacturenavette = @id
    `;
    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("idFacture", getSql().Int, idFacture)
      .query(updateFactureQuery);

    const getMontantAvanceQuery = `
      SELECT montantAvance
      FROM DAF_factureNavette
      WHERE idFacture = @idFacture
    `;
console.log('id',idFacture)

    const result = await pool
      .request()
      .input("idFacture", getSql().Int, idFacture)
      .query(getMontantAvanceQuery);

    const montantAvance = result.recordset[0].montantAvance;

    // Récupérer le TTC de la table FactureReceptionne
    const getTtcQuery = `
      SELECT TTC
      FROM factureresptionne
      WHERE id = @idFacture
    `;
    const ttcResult = await pool
      .request()
      .input("idFacture", getSql().Int, idFacture)
      .query(getTtcQuery);

    const ttc = ttcResult.recordset[0].TTC;

    // Calculer le NetAPayer en soustrayant le montant de l'avance de la valeur TTC
    const netAPayer = ttc - montantAvance;

    // Mettre à jour le champ NetAPayer dans la table FactureReceptionne
    const updateQuery = `
      UPDATE factureresptionne
      SET NetAPayer = @netAPayer
      WHERE id = @idFacture
    `;
    await pool
      .request()
      .input("netAPayer", getSql().Float, netAPayer)
      .input("idFacture", getSql().Int, idFacture)
      .query(updateQuery);

    console.log(`Updated NetAPayer for idFacture ${idFacture}: ${netAPayer}`);

    res.json({
      id: req.params.id,
      ficheNavette,
      idFacture,
      CODEAFFAIRE
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};
