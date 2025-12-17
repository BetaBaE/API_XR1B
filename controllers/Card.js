const { getConnection, getSql } = require("../database/connection");
const { cardQuery } = require("../database/CardQuery");

// Calculer la somme des factures depuis la base de données (comme Cheque)
async function calculSumFactures(facturelist) {
  let facturelistString = facturelist.join("','");

  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT SUM(netapayer) as Totale
      FROM (
        SELECT SUM(MontantAPaye) as netapayer 
        FROM [dbo].[DAF_CalculRasNetApaye]
        WHERE id IN ('${facturelistString}')
      ) sum 
    `);

    return result.recordset[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Récupérer les factures depuis la vue (comme Cheque)
async function getFactureFromView(facturelist) {
  let facturelistString = facturelist.join("','");

  try {
    const pool = await getConnection();
    const result = await pool.request().query(
      `${cardQuery.getDataFromLogFacture} and id in('${facturelistString}')`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Insérer les factures dans les logs
async function insertFactureInLog(ArrayOfFacture, ModePaiementID, dateOperation) {
  let query = ` `;
  
  ArrayOfFacture.forEach(
    (
      {
        CODEDOCUTIL,
        chantier,
        nom,
        LIBREGLEMENT,
        DateFacture,
        TTC,
        HT,
        MontantTVA,
        MontantAPaye,
        id,
        RAS,
        MontantRasIR,
      },
      i
    ) => {
      const escapedNom = nom?.replaceAll(/'/g, "''");
      const formattedDate = DateFacture
        ? new Date(DateFacture).toISOString().slice(0, 10)
        : "NULL";

      i != ArrayOfFacture.length - 1
        ? (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement card','${
            DateFacture === null ? id : 0
          }','paiement card','0','${id}','0','Reglee','${dateOperation}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement card','${
            DateFacture === null ? id : 0
          }','paiement card','0','${id}','0','Reglee','${dateOperation}')`);
    }
  );

  console.log(`${cardQuery.createLogFacture}${query}`);

  try {
    const pool = await getConnection();
    await pool.request().query(`${cardQuery.createLogFacture}${query}`);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Insérer les restitutions d'avance
async function insertAvanceInRestit(ArrayOfFacture, Redacteur) {
  let query = ``;
  
  ArrayOfFacture.forEach(({ MontantAPaye, id, RAS, nom, MontantRasIR }, i) => {
    // Vérifier si l'ID commence par 'Av'
    if (id.startsWith("Av")) {
      const Montantglobal = MontantAPaye + RAS + MontantRasIR;
      const idInt = id.substring(2, id.length);
      const escapedNom = nom?.replaceAll(/'/g, "''");

      i != ArrayOfFacture.length - 1
        ? (query += `('${idInt}','${Montantglobal}','${Redacteur}','Reglee','${escapedNom}','paiement card'),`)
        : (query += `('${idInt}','${Montantglobal}','${Redacteur}','Reglee','${escapedNom}','paiement card')`);
    }
  });

  // Retirer la virgule finale s'il y en a une
  query = query.endsWith(",") ? query.slice(0, -1) : query;

  if (query) {
    console.log(`${cardQuery.createRestit}${query}`);

    try {
      const pool = await getConnection();
      await pool.request().query(`${cardQuery.createRestit}${query}`);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
}

// Créer un nouveau paiement par carte
exports.createCard = async (req, res) => {
  try {
    const {
      fournisseurId,
      RibAtner,
      dateOperation,
      Redacteur,
      facturelist,
      Observation,
    } = req.body;

    // Calculer le montant total depuis la base de données (comme Cheque)
    let { Totale } = await calculSumFactures(facturelist);

    // Récupérer les factures depuis la vue
    let ArrayOfFacture = await getFactureFromView(facturelist);

    // Insérer le paiement par carte
    const pool = await getConnection();
    const cardResult = await pool
      .request()
      .input("fournisseurId", getSql().Int, fournisseurId)
      .input("RibAtner", getSql().Int, RibAtner)
      .input("montantVirement", getSql().Float, Totale)
      .input("dateOperation", getSql().Date, dateOperation)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("Observation", getSql().VarChar, Observation || null)
      .query(cardQuery.create);


    // Insérer les restitutions d'avance
    await insertAvanceInRestit(ArrayOfFacture, Redacteur);
    
    // Insérer les factures dans les logs
    await insertFactureInLog(ArrayOfFacture, RibAtner, dateOperation);



    res.status(201).json({
      id: '',
      message: "Paiement par carte créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création du paiement par carte:", error);
    res.status(500).json({
      message: "Erreur lors de la création du paiement par carte",
      error: error.message,
    });
  }
};

// Récupérer tous les paiements par carte
exports.getAllCards = async (req, res) => {
  try {
    const pool = await getConnection();
    let query = cardQuery.getAll;

    // Filtres optionnels
    const { 
      dateOperationMin, 
      dateOperationMax, 
      dateCreationMin, 
      dateCreationMax,
      fournisseur, 
      CodeFournisseur,
      nom,
      etat 
    } = req.query;

    if (dateOperationMin && dateOperationMax) {
      query += ` AND v.dateOperation BETWEEN '${dateOperationMin}' AND '${dateOperationMax}'`;
    }
    if (dateCreationMin && dateCreationMax) {
      query += ` AND v.DateCreation BETWEEN '${dateCreationMin}' AND '${dateCreationMax}'`;
    }
    if (fournisseur) {
      query += ` AND f.nom LIKE '%${fournisseur}%'`;
    }
    if (CodeFournisseur) {
      query += ` AND f.CodeFournisseur LIKE '%${CodeFournisseur}%'`;
    }
    if (nom) {
      query += ` AND rf.nom LIKE '%${nom}%'`;
    }
    if (etat) {
      query += ` AND v.Etat = '${etat}'`;
    }

    query += " ORDER BY v.id DESC";

    const result = await pool.request().query(query);
    
    const range = req.query.range ? JSON.parse(req.query.range) : [0, 24];
    
    res.set(
      "Content-Range",
      `card ${range[0]}-${range[1]}/${result.recordset.length}`
    );
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements par carte:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements par carte",
      error: error.message,
    });
  }
};

// Récupérer un paiement par carte spécifique
exports.getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().Int, id)
      .query(cardQuery.getOne);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Paiement par carte non trouvé",
      });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement par carte:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du paiement par carte",
      error: error.message,
    });
  }
};

// Mettre à jour un paiement par carte
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateOperation, Etat, Observation } = req.body;
    const pool = await getConnection();

    // Récupérer les informations du paiement par carte
    const cardResult = await pool
      .request()
      .input("id", getSql().Int, id)
      .query(cardQuery.getOne);

    if (cardResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Paiement par carte non trouvé",
      });
    }

    const card = cardResult.recordset[0];
    const oldEtat = card.Etat;

    // Mettre à jour le paiement par carte
    await pool
      .request()
      .input("id", getSql().Int, id)
      .input("dateOperation", getSql().Date, dateOperation)
      .input("Etat", getSql().VarChar, Etat)
      .input("Observation", getSql().VarChar, Observation || null)
      .query(cardQuery.update);

    // Mettre à jour les logs de factures en fonction du changement d'état
    if (Etat === "Annuler" && oldEtat !== "Annuler") {
      // Annuler les factures liées
      await pool
        .request()
        .input("cardId", getSql().Int, id)
        .input("ribatnerid", getSql().Int, card.ribatnerid)
        .query(cardQuery.updateLogFactureWhenAnnuleCard);

      // Annuler les restitutions liées
      await pool
        .request()
        .input("cardId", getSql().Int, id)
        .query(cardQuery.updateRestitWhenAnnuleCard);
    } else if (Etat === "Reglee" && oldEtat !== "Reglee") {
      // Régler les factures liées
      await pool
        .request()
        .input("cardId", getSql().Int, id)
        .input("ribatnerid", getSql().Int, card.ribatnerid)
        .input("dateOperation", getSql().Date, dateOperation)
        .query(cardQuery.updateLogFactureWhenRegleeCard);

      // Régler les restitutions liées
      await pool
        .request()
        .input("cardId", getSql().Int, id)
        .query(cardQuery.updateRestitWhenRegleeCard);
    }

    res.status(200).json({
      id: id,
      message: "Paiement par carte mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement par carte:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du paiement par carte",
      error: error.message,
    });
  }
};

// Récupérer le nombre total de paiements par carte
exports.getCardCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(cardQuery.getCount);

    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de paiements par carte:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du nombre de paiements par carte",
      error: error.message,
    });
  }
};

// Récupérer les données pour l'impression
exports.getCardPrintData = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Récupérer l'en-tête du paiement par carte
    const headerResult = await pool
      .request()
      .input("id", getSql().Int, id)
      .query(cardQuery.getCardHeaderById);

    if (headerResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Paiement par carte non trouvé",
      });
    }

    // Récupérer les lignes de factures
    const linesResult = await pool
      .request()
      .input("id", getSql().Int, id)
      .query(cardQuery.getCardPrintLinesById);

    // Récupérer la somme totale
    const sumResult = await pool
      .request()
      .input("id", getSql().Int, id)
      .query(cardQuery.getSumCard);

    res.status(200).json({
      header: headerResult.recordset[0],
      lines: linesResult.recordset,
      sum: sumResult.recordset[0],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données d'impression:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des données d'impression",
      error: error.message,
    });
  }
};

// Récupérer les paiements par carte en cours
exports.getCardsEnCours = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(cardQuery.getCardEncours);

    res.status(200).json({
      data: result.recordset,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements par carte en cours:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements par carte en cours",
      error: error.message,
    });
  }
};