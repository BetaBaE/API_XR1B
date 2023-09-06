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
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    console.log(filter);
    let queryFilter = "";

    if (filter.ficheNavette) {
      queryFilter += ` and upper(fich.ficheNavette) like (upper('%${filter.ficheNavette}%'))`;
    }
    if (filter.chantier) {
      queryFilter += ` and upper(fich.LIBELLE) like (upper('%${filter.chantier}%'))`;
    }
    
    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande)  like ('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(fich.nom) like (upper('%${filter.fournisseur}%'))`;
    }
    
    if (filter.designation) {
      queryFilter += ` and upper(designation) like (upper('%${filter.designation}%'))`;
    }
    
    if (filter.numeroFacture) {
      queryFilter += ` and upper(fich.numeroFacture)  like ('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(CodeFournisseur) like (upper('%${filter.CodeFournisseur}%'))`;
    }
    
    // Modifier la construction de la clause WHERE
    let whereClause = queryFilter ? `${queryFilter}` : "";
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
    console.log(error.message)
    res.send(error.message);
  }
};


exports.createfacture = async (req, res) => {
  const {
    codechantier,
    idFacture,
    ficheNavette,
    idfournisseur,
    montantAvance,
    service,
    fullName,
    numeroficheNavette,
    Bcommande
  } = req.body;

  try {
    const pool = await getConnection();

    const existingCompositionQuery = `
      SELECT *
      FROM daf_factureNavette AS dfn1
      WHERE dfn1.codechantier = @codechantier
        AND dfn1.ficheNavette = @ficheNavette
        AND dfn1.Bcommande = @Bcommande
        AND dfn1.idfournisseur = @idfournisseur
        AND EXISTS (
          SELECT 1
          FROM daf_factureNavette AS dfn2
          WHERE dfn2.codechantier = dfn1.codechantier
            AND dfn2.ficheNavette = dfn1.ficheNavette
            AND dfn2.Bcommande = dfn1.Bcommande
            AND dfn2.idfournisseur <> dfn1.idfournisseur
        );
    `;

    const existingCompositionResult = await pool
      .request()
      .input("codechantier", getSql().VarChar, codechantier)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("Bcommande", getSql().VarChar, Bcommande)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .query(existingCompositionQuery);

    if (existingCompositionResult.recordset.length > 0) {
      // La composition existe déjà, renvoyer une réponse d'erreur
      res.status(400).json({ message: "La composition existe déjà dans la table daf_factureNavette" });
    } else {
      let modifiedFicheNavette = ficheNavette;

      if (service) {
        modifiedFicheNavette = `admin/${new Date().getFullYear()}/${service}/${ficheNavette}`;
      }

      const insertQuery = `
        INSERT INTO [dbo].[DAF_factureNavette]
        ([codechantier], [montantAvance], [idfournisseur], [idFacture], [ficheNavette], [Bcommande], [fullname])
        VALUES 
        (@codechantier, @montantAvance, @idfournisseur, @idFacture, @modifiedFicheNavette, @Bcommande, @fullName)
      `;

      await pool
        .request()
        .input("codechantier", getSql().VarChar, codechantier)
        .input("montantAvance", getSql().Numeric(10, 2), montantAvance)
        .input("idfournisseur", getSql().Int, idfournisseur)
        .input("idFacture", getSql().Int, idFacture)
        .input("modifiedFicheNavette", getSql().VarChar, modifiedFicheNavette)
        .input("Bcommande", getSql().VarChar, Bcommande)
        .input("fullName", getSql().VarChar, fullName)
        .query(insertQuery);

      res.json({
        id: "",
        codechantier,
        idFacture,
        ficheNavette: modifiedFicheNavette,
        idfournisseur,
        montantAvance
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
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
  const { ficheNavette, idFacture,  montantAvance: inputMontantAvance
    ,idfournisseur,codechantier,annulation
    
  } = req.body;
  try {
    const pool = await getConnection();
    const updateFactureQuery = `
      UPDATE DAF_factureNavette
      SET ficheNavette = @ficheNavette,
          idFacture = @idFacture,
          codechantier=@codechantier,
          idfournisseur=@idfournisseur,
          montantAvance = @montantAvance
      WHERE idfacturenavette = @id
    `;
    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("codechantier", getSql().VarChar, codechantier)
      .input("idFacture", getSql().Int, idFacture)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("montantAvance", getSql().Int, inputMontantAvance)
      .input("annulation", getSql().VarChar, annulation)
      
    const getMontantAvanceQuery = `
      SELECT montantAvance
      FROM DAF_factureNavette
      WHERE idFacture = @idFacture
    `;

    const result = await pool
      .request()
      .input("idFacture", getSql().Int, idFacture)
      .query(getMontantAvanceQuery);
    const updatedMontantAvance = result.recordset[0].montantAvance;

    const getTtcQuery = `
      SELECT TTC
      FROM factureresptionne
      WHERE id = @idFacture
    `;
    const ttcResult = await pool
      .request()
      .input("idFacture", getSql().Int, idFacture)
      .query(getTtcQuery);

    let ttc = 0;
    if (ttcResult.recordset.length > 0) {
      ttc = ttcResult.recordset[0]?.TTC || 0;
    }

    // Calculate the NetAPayer by subtracting the advance amount from the TTC value
    const netAPayer = ttc - updatedMontantAvance;

    // Update the NetAPayer field in the factureresptionne table
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
      codechantier,
      montantAvance: updatedMontantAvance
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};
exports.correction = async (req, res) => {
  const { ficheNavette, idFacture,montantAvance
    ,idfournisseur,codechantier,BonCommande,
    annulation
  } = req.body;
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("codechantier", getSql().VarChar, codechantier)
      .input("idFacture", getSql().Int, idFacture)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("montantAvance", getSql().Int, montantAvance)
      .input("BonCommande", getSql().VarChar, BonCommande)
      .input("annulation", getSql().VarChar, annulation)
      .query(factureFicheNavette.update);
      if (annulation === "Annuler") {
        updateFNWhenAnnuleVirement(req.params.id);
      }

    res.json({
      id: req.params.id,
      ficheNavette,
      idFacture,
      codechantier,
      montantAvance,
      annulation
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};



exports.annulation = async (req, res) => {
  const { id
    
  } = req.body;
  try {
    const pool = await getConnection();
    await pool
    .request()
    .input("id", getSql().Int, id)
    
    .query(factureFicheNavette.annulationFn);

    res.json({
      message: "Annulation réussie",
    });
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
};


async function updateFNWhenAnnuleVirement(id) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, id)
     
      .query(factureFicheNavette.annulationFn);

      console.log(`${factureFicheNavette.annulationFn}` + "ma requete")
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}














