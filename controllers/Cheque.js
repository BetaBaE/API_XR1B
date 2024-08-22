const { getConnection, getSql } = require("../database/connection");
const { cheque } = require("../database/ChequeQuery");

const MontantFixed = (num) => {
  return parseFloat(num.toFixed(2));
};

async function calculSumFactures(facturelist) {
  let facturelistString = facturelist.join("','");

  console.log(facturelist.join("','"));
  try {
    console.log(`SELECT  SUM(netapayer) as Totale
  FROM(
    select sum(MontantAPaye) as netapayer from [dbo].[DAF_CalculRasNetApaye]
	  where  id in ('${facturelistString}')
    ) sum `);
    const pool = await getConnection();
    const result = await pool.request()
      .query(` SELECT   SUM(netapayer)  as Totale
  FROM(
    select sum(MontantAPaye) as netapayer from [dbo].[DAF_CalculRasNetApaye]
	  where  id in ('${facturelistString}')
    ) sum `);

    return result.recordset[0];
  } catch (error) {
    console.error(error.message);
    // res.status(500);
  }
}
async function getFactureFromView(facturelist) {
  let facturelistString = facturelist.join("','");

  try {
    const pool = await getConnection();
    const result = await pool
      .request()

      .query(
        `${cheque.getDataFromLogFacture} and id in('${facturelistString}')`
      );
    console.log(
      "test",
      `${cheque.getDataFromLogFacture} and id in('${facturelistString}')`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function insertFactureInLog(
  ArrayOfFacture,
  ModePaiementID,
  numerocheque
) {
  let query = ` `;
  ArrayOfFacture.forEach(
    async (
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
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement cheque','${
            DateFacture === null ? id : 0
          }','${numerocheque}','${RAS}','${id}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement cheque','${
            DateFacture === null ? id : 0
          }','${numerocheque}','${RAS}','${id}')`);
    }
  );
  console.log(`${cheque.createLogFacture} '${query}'`);

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${cheque.createLogFacture}${query}`);
  } catch (error) {
    console.error(error.message);
  }
}
async function insertAvanceInRestit(
  ArrayOfFacture,
  orderVirementId,
  Redacteur
) {
  let query = ``;
  console.log(ArrayOfFacture);
  ArrayOfFacture.forEach(({ MontantAPaye, id, RAS, nom }, i) => {
    // Vérifier si l'ID commence par 'Av'
    if (id.startsWith("Av")) {
      const Montantglobal = MontantAPaye + RAS;
      const idInt = id.substring(2, id.length);

      i != ArrayOfFacture.length - 1
        ? (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${nom}','${orderVirementId}'),`)
        : (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${nom}','${orderVirementId}')`);
    }
  });

  // Retirer la virgule finale s'il y en a une
  query = query.endsWith(",") ? query.slice(0, -1) : query;

  console.log(`${cheque.createRestit} '${query}'`);
  console.log(`${query}`);

  try {
    const pool = await getConnection();
    const result = await pool.request().query(`${cheque.createRestit}${query}`);
  } catch (error) {
    console.error(error.message);
  }
}

async function ChangeEtatEnCoursAvance(ArrayOfFacture) {
  if (!Array.isArray(ArrayOfFacture) || ArrayOfFacture.length === 0) {
    throw new Error("ArrayOfFacture doit être un tableau non vide");
  }
  let query = ``;
  ArrayOfFacture.forEach(({ id }, i) => {
    // Vérifier si l'ID commence par 'Av'
    if (id.startsWith("Av")) {
      const idInt = id.substring(2, id.length);
      // Construire la partie de la requête pour cet ID
      query += `update DAF_Avance  SET Etat='En Cours'  WHERE id='${idInt}'; `;
    }
    if (query === "" && id.startsWith("fr")) {
      // throw new Error("Aucun ID valide trouvé commençant par 'Av'");
    }
  });
  // Retirer la dernière virgule et l'espace finale s'il y en a une
  query = query.trim();

  try {
    const pool = await getConnection();
    // Affichez la requête avant exécution pour vérification
    console.log("Requête SQL exécutée :", query);
    const result = await pool.request().query(query);
    // Affichez le résultat de la requête
    console.log("Résultat de la requête :", result);
    return result.recordset;
  } catch (error) {
    console.error("Erreur lors de la modification de l'état :", error.message);
    throw error;
  }
}
async function insertDocInRas(ArrayOfFacture, numerocheque) {
  let query = "";
  let autorise = false;

  for (const {
    idFournisseur,
    CODEDOCUTIL,
    CatFn,
    nom,
    DateFacture,
    HT,
    MontantTVA,
    RAS,
    TVA,
  } of ArrayOfFacture) {
    console.log("RAS", RAS);
    if (RAS != 0) {
      const escapedNom = nom?.replace(/'/g, "''");
      const formattedDate = DateFacture
        ? new Date(DateFacture).toISOString().slice(0, 10)
        : null;
      const PourcentageRas = Math.round((RAS / MontantTVA) * 100);

      const formattedDateFacture =
        formattedDate === null ? "NULL" : `'${formattedDate}'`;
      const formattedCatFn = CatFn === null ? "NULL" : `'${CatFn}'`;

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, '${HT}', '${MontantTVA}', '${TVA}', '${RAS}', '${PourcentageRas}', '${numerocheque}', '${escapedNom}')`;

      query += (query ? "," : "") + queryPart;
      autorise = true;
    }
  }

  if (autorise) {
    try {
      const fullQuery = `${cheque.CreateRasFactue} ${query}`;
      console.log("fullQuery", fullQuery);

      // Assuming you have a pool object available to get the connection
      const pool = await getConnection();
      const result = await pool.request().query(fullQuery);

      console.log("Insert successful", result);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  }
}

async function updateRasWhenAnnule(numerocheque) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)

      .query(cheque.updateRasWhenAnnule);

    console.log(`${cheque.u}` + "ma requete");
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function ChangeEtatReglerAvanceFacture(numerocheque) {
  try {
    const pool = await getConnection();

    // Requête 1 : Mise à jour de DAF_Avance
    let query1 = `
      UPDATE DAF_Avance
      SET Etat = 'Reglee'
      WHERE id IN (
        SELECT idavance
        FROM DAF_RestitAvance
        WHERE Etat   IN ('Reglee')
          AND ModePaiement = @numerocheque
      
      )
      AND etat NOT IN ('AnnulerSasie')
    `;

    // Requête 2 : Mise à jour de DAF_FactureSaisie
    let query2 = `
   UPDATE  fs
SET  fs.AcompteVal += rs.Montant
FROM DAF_FactureSaisie fs
INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
WHERE rs.ModePaiement = @numerocheque
  AND rs.Etat  IN ('Reglee');

    `;

    // Préparation des requêtes
    const request1 = pool.request();
    request1.input("numerocheque", numerocheque);

    const request2 = pool.request();
    request2.input("numerocheque", numerocheque);

    // Exécution des requêtes
    console.log("Requête SQL exécutée 1:", query1);
    const result1 = await request1.query(query1);
    console.log("Résultat de la requête 1:", result1);

    console.log("Requête SQL exécutée 2:", query2);
    const result2 = await request2.query(query2);
    console.log("Résultat de la requête 2:", result2);

    return {
      result1: result1.recordset,
      result2: result2.recordset,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de l'état :", error.message);
    throw error;
  }
}

async function ChangeEtatReglerAvanceFacture(numerocheque) {
  try {
    const pool = await getConnection();

    // Requête 1 : Mise à jour de DAF_Avance
    let query1 = `
      UPDATE DAF_Avance
      SET Etat = 'Reglee'
      WHERE id IN (
        SELECT idavance
        FROM DAF_RestitAvance
        WHERE Etat   IN ('Reglee')
          AND ModePaiement = @numerocheque
          
      )
      AND etat NOT IN ('AnnulerSasie')
    `;

    // Requête 2 : Mise à jour de DAF_FactureSaisie
    let query2 = `
   UPDATE  fs
SET  fs.AcompteVal += rs.Montant
FROM DAF_FactureSaisie fs
INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
WHERE rs.ModePaiement = @numerocheque
  
  AND rs.Etat  IN ('Reglee');

    `;

    // Préparation des requêtes
    const request1 = pool.request();
    request1.input("numerocheque", numerocheque);

    const request2 = pool.request();
    request2.input("numerocheque", numerocheque);

    // Exécution des requêtes
    console.log("Requête SQL exécutée 1:", query1);
    const result1 = await request1.query(query1);
    console.log("Résultat de la requête 1:", result1);

    console.log("Requête SQL exécutée 2:", query2);
    const result2 = await request2.query(query2);
    console.log("Résultat de la requête 2:", result2);

    return {
      result1: result1.recordset,
      result2: result2.recordset,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de l'état :", error.message);
    throw error;
  }
}

async function updateLogFactureWhenAnnuleCheque(numerocheque) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)
      .query(cheque.updateLogFactureWhenAnnuleV);

    console.log(`${cheque.updateLogFactureWhenAnnuleV}` + "ma requete");
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateRestitWhenAnnuleCheque(numerocheque) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)
      .query(cheque.updateRestitWhenAnnuleCheque);

    console.log(`${cheque.updateRestitWhenAnnuleCheque}` + "ma requete");
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateLogFactureWhenRegleecheque(numerocheque, dateOperation) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)
      .input("dateOperation", getSql().Date, dateOperation)
      .query(cheque.updateLogFactureWhenRegleeCheque);

    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateRestitWhenRegleecheque(numerocheque) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)

      .query(cheque.updateRestitWhenRegleecheque);

    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function ChangeEtatAnnulerAvanceFacture(numerocheque) {
  try {
    const pool = await getConnection();

    // Requête 1 : Mise à jour de DAF_Avance
    let query1 = `
      UPDATE DAF_Avance
      SET Etat = 'AnnulerPaiement'
      WHERE id IN (
        SELECT idavance
        FROM DAF_RestitAvance
        WHERE Etat NOT IN ('Reglee')
          AND ModePaiement = @numerocheque
      )
      AND etat NOT IN ('AnnulerSasie')
    `;

    // Requête 2 : Mise à jour de DAF_FactureSaisie
    let query2 = `
   UPDATE  fs
SET  fs.AcompteReg -= rs.Montant
FROM DAF_FactureSaisie fs
INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
WHERE rs.ModePaiement = @numerocheque
 
  AND rs.Etat  IN ('AnnulerPaiement');

    `;

    // Préparation des requêtes
    const request1 = pool.request();
    request1.input("numerocheque", numerocheque);

    const request2 = pool.request();
    request2.input("numerocheque", numerocheque);

    // Exécution des requêtes
    console.log("Requête SQL exécutée 1:", query1);
    const result1 = await request1.query(query1);
    console.log("Résultat de la requête 1:", result1);

    console.log("Requête SQL exécutée 2:", query2);
    const result2 = await request2.query(query2);
    console.log("Résultat de la requête 2:", result2);

    return {
      result1: result1.recordset,
      result2: result2.recordset,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de l'état :", error.message);
    throw error;
  }
}
async function updateRasWhenRegleecheque(numerocheque, dateOperation) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)
      .input("dateOperation", getSql().VarChar, dateOperation)
      .query(cheque.updateRasWhenRegleeCheque);

    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

exports.getChequeCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(cheque.getCount);
    req.count = result.recordset[0].count;
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.createcheque = async (req, res) => {
  // console.log(req.body);
  let { facturelist } = req.body;
  let { Totale } = await calculSumFactures(facturelist);
  //let num = MontantFixed(Totale);
  let ArrayOfFacture = await getFactureFromView(facturelist);
  insertFactureInLog(ArrayOfFacture, req.body.RibAtner, req.body.numerocheque);
  insertDocInRas(ArrayOfFacture, req.body.numerocheque);
  insertAvanceInRestit(
    ArrayOfFacture,
    req.body.numerocheque,
    req.body.Redacteur
  );
  ChangeEtatEnCoursAvance(ArrayOfFacture);
  console.log(req.body, Totale);
  console.log("cheque", cheque.create);
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("RibAtner", getSql().Int, req.body.RibAtner)
      .input("fournisseurId", getSql().Int, req.body.fournisseurId)
      .input("montantVirement", getSql().Float, Totale)
      .input("numerocheque", getSql().VarChar, req.body.numerocheque)
      .input("datecheque", getSql().Date, req.body.datecheque)
      .input("dateecheance", getSql().Date, req.body.dateecheance)
      .input("Redacteur", getSql().VarChar, req.body.Redacteur)
      .query(cheque.create);

    res.json({ id: "" });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
    res.status(500);
  }
  // return res.json([{ id: "id" }]);
};

exports.getCheque = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";
    if (filter.numerocheque) {
      queryFilter += ` and upper(numerocheque) like(upper('%${filter.numerocheque}%'))`;
    }
    if (filter.nom) {
      queryFilter += ` and upper(rf.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(f.nom) like(upper('%${filter.fournisseur}%'))`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and f.CodeFournisseur like('%${filter.CodeFournisseur}%')`;
    }
    if (filter.datechequeMin) {
      queryFilter += ` and datecheque >'${filter.datechequeMin}'`;
    }

    if (filter.datechequeMax) {
      queryFilter += ` and datecheque < '${filter.datechequeMax}'`;
    }

    if (filter.dateecheanceMin) {
      queryFilter += ` and dateecheance >'${filter.dateecheanceMin}'`;
    }

    if (filter.dateecheanceMax) {
      queryFilter += ` and dateecheance < '${filter.dateecheanceMax}'`;
    }
    console.log(queryFilter);
    const pool = await getConnection();
    const result = await pool.request().query(
      `${cheque.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `cheque ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateCheque = async (req, res) => {
  console.log(req.body);
  const { dateOperation, Etat, numerocheque } = req.body;

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("dateOperation", getSql().Date, dateOperation)
      .input("Etat", getSql().VarChar, Etat)
      .input("id", getSql().Int, req.params.id)
      .input("numerocheque", getSql().VarChar, numerocheque)
      .query(cheque.update);
    if (Etat === "Annuler") {
      updateLogFactureWhenAnnuleCheque(numerocheque);
      updateRasWhenAnnule(numerocheque);
      updateRestitWhenAnnuleCheque(numerocheque);
      ChangeEtatAnnulerAvanceFacture(numerocheque);
    }
    if (Etat === "Reglee") {
      updateLogFactureWhenRegleecheque(numerocheque, dateOperation);
      updateRasWhenRegleecheque(numerocheque, dateOperation);
      updateRestitWhenRegleecheque(numerocheque);
      ChangeEtatReglerAvanceFacture(numerocheque);
    }
    res.json({
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneChequeById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(cheque.getOne);

    res.set("Content-Range", `Cheque 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
