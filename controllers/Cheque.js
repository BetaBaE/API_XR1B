const { getConnection, getSql } = require("../database/connection");
const { cheque } = require("../database/ChequeQuery");
const html_to_pdf = require("html-pdf-node");
const fs = require("fs");
const { ToWords } = require("to-words");
const { toUpper } = require("lodash");

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
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement cheque','${
            DateFacture === null ? id : 0
          }','${numerocheque}','${RAS}','${id}','${MontantRasIR}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement cheque','${
            DateFacture === null ? id : 0
          }','${numerocheque}','${RAS}','${id}','${MontantRasIR}')`);
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
  ArrayOfFacture.forEach(({ MontantAPaye, id, RAS, nom, MontantRasIR }, i) => {
    // Vérifier si l'ID commence par 'Av'
    if (id.startsWith("Av")) {
      const Montantglobal = MontantAPaye + RAS + MontantRasIR;
      const idInt = id.substring(2, id.length);
      const escapedNom = nom?.replaceAll(/'/g, "''");

      i != ArrayOfFacture.length - 1
        ? (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${escapedNom}','${orderVirementId}'),`)
        : (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${escapedNom}','${orderVirementId}')`);
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
    id,
  } of ArrayOfFacture) {
    console.log("RAS", RAS);
    if (RAS > 10) {
      const escapedNom = nom?.replace(/'/g, "''");
      const formattedDate = DateFacture
        ? new Date(DateFacture).toISOString().slice(0, 10)
        : null;
      const PourcentageRas = Math.round((RAS / MontantTVA) * 100);

      const formattedDateFacture =
        formattedDate === null ? "NULL" : `'${formattedDate}'`;
      const formattedCatFn = CatFn === null ? "NULL" : `'${CatFn}'`;

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, '${HT}', '${MontantTVA}', '${TVA}', '${RAS}', '${PourcentageRas}', '${numerocheque}', '${escapedNom}', '${id}')`;

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

async function insertDocInRasIR(ArrayOfFacture, orderVirementId) {
  let query = "";
  let autorise = false;

  for (const {
    idFournisseur,
    CODEDOCUTIL,
    CatFn,
    nom,
    DateFacture,
    HT,
    id,
    MontantRasIR,
  } of ArrayOfFacture) {
    console.log("RASIR", MontantRasIR);
    if (MontantRasIR != 0) {
      const escapedNom = nom?.replace(/'/g, "''");
      const formattedDate = DateFacture
        ? new Date(DateFacture).toISOString().slice(0, 10)
        : null;

      const formattedDateFacture =
        formattedDate === null ? "NULL" : `'${formattedDate}'`;
      const formattedCatFn = CatFn === null ? "NULL" : `'${CatFn}'`;

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, '${HT}', '${MontantRasIR}', '${orderVirementId}', '${escapedNom}', '${id}')`;

      query += (query ? "," : "") + queryPart;
      autorise = true;
    }
  }
  if (autorise) {
    try {
      const fullQuery = `${cheque.CreateRasIRFacture} ${query}`;
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
      AND etat NOT IN ('Annuler')
    `;

    // RFactureSaisieequête 2 : Mise à jour de DAF_
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
      AND etat NOT IN ('Annuler')
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
      SET Etat = 'Annuler'
      WHERE id IN (
        SELECT idavance
        FROM DAF_RestitAvance
        WHERE Etat NOT IN ('Reglee')
          AND ModePaiement = @numerocheque
      )
      AND etat NOT IN ('Annuler')
    `;

    // Requête 2 : Mise à jour de DAF_FactureSaisie
    let query2 = `
   UPDATE  fs
SET  fs.AcompteReg -= rs.Montant
FROM DAF_FactureSaisie fs
INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
WHERE rs.ModePaiement = @numerocheque
 
  AND rs.Etat  IN ('Annuler');

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
  insertDocInRasIR(ArrayOfFacture, req.body.numerocheque);

  insertAvanceInRestit(
    ArrayOfFacture,
    req.body.numerocheque,
    req.body.Redacteur
  );
  // ChangeEtatEnCoursAvance(ArrayOfFacture); // trigger log_facture
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
      // updateRasWhenAnnule(numerocheque);
      // updateRestitWhenAnnuleCheque(numerocheque);// replace with trigger log_facture et restit
      // ChangeEtatAnnulerAvanceFacture(numerocheque); // replace with trigger log_facture et restit
    }
    if (Etat === "Reglee") {
      updateLogFactureWhenRegleecheque(numerocheque, dateOperation);
      // updateRasWhenRegleecheque(numerocheque, dateOperation);
      // updateRestitWhenRegleecheque(numerocheque);
      // ChangeEtatReglerAvanceFacture(numerocheque);
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
exports.getChequeEncours = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(cheque.getChequeEncours);

    res.set("Content-Range", `Cheque 0-99/100`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

const addZero = (num) => {
  let str = num.toString();
  if (str.length === 1) {
    //console.log("inside if:" + str.length);
    return "0" + "" + str;
  }
  return str;
};

exports.PrintCheque = async (req, res) => {
  const toWords = new ToWords({
    localeCode: "fr-FR",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      currencyOptions: {
        // can be used to override defaults for the selected locale
        // name: 'DIRHAMS',
        plural: "DIRHAMS",
        fractionalUnit: {
          // name: 'CENTIMES',
          plural: "CENTIMES",
          symbol: "",
        },
      },
    },
  });

  function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  let options = { format: "A4" };

  let printData = {
    header: {},
    body: [],
    edit: false,
    path: "",
    resulsumvirement: function (data) {
      // Fonction pour formater les données avec des virgules
      return data.toLocaleString();
    },
  };

  let filter = req.query.idcheque || "{}";
  filter = JSON.parse(filter);
  console.log("id cheque :", filter.id);

  try {
    const pool = await getConnection();
    let html = ``;
    let result = await pool
      .request()
      .input("id", getSql().VarChar, filter.id)
      .query(cheque.getChequeHeaderById);
    printData.header = result.recordset;

    let date = new Date();

    //console.log(addZero(1));

    let year = date.getFullYear();
    let month = addZero(date.getMonth() + 1);
    let day = addZero(date.getDate());
    let hour = addZero(date.getHours());
    let min = addZero(date.getMinutes());
    let sec = addZero(date.getSeconds());

    let concat = year + "" + month + "" + day + "" + hour + "" + min + "" + sec;

    let currentDate = new Date();
    let today = `${addZero(currentDate.getDate())}/${addZero(
      currentDate.getMonth() + 1
    )}/${addZero(currentDate.getFullYear())}`;

    result = await pool
      .request()
      .input("id", getSql().VarChar, filter.id)
      .query(cheque.getChequePrintLinesById);
    printData.body = result.recordset;

    let resultsumchq = await pool
      .request()
      .input("id", getSql().VarChar, filter.id)
      .query(cheque.getSumCheque);

    printData.resulsumvirement = resultsumchq.recordset[0].SumCheque;

    let trdata = "";
    //   let res = "";
    //   let to_words = toWords.convert(x).toLocaleUpperCase();
    //   console.log("to_words", to_words);
    //   if (to_words.includes("VIRGULE")) {
    //     let [integerPart, decimalPart] = to_words.split("VIRGULE");

    //     // Vérifie si decimalPart est null et le remplace par une chaîne vide
    //     decimalPart = decimalPart || "";

    //     // res = integerPart + " DIRHAMS";
    //     res = integerPart;
    //     // Traitement de la partie décimale
    //     if (decimalPart) {
    //       let decimalInWords = "";
    //       if (decimalPart.trim() === "UN") {
    //         decimalInWords = "DIX CENTIMES";
    //       } else if (decimalPart.trim() === "DEUX") {
    //         decimalInWords = "VINGT CENTIMES";
    //       } else if (decimalPart.trim() === "TROIS") {
    //         decimalInWords = "TRENTE CENTIMES";
    //       } else if (decimalPart.trim() === "QUATRE") {
    //         decimalInWords = "QUARANTE CENTIMES";
    //       } else if (decimalPart.trim() === "CINQ") {
    //         decimalInWords = "CINQUANTE CENTIMES";
    //       } else if (decimalPart.trim() === "SIX") {
    //         decimalInWords = "SOIXANTE CENTIMES";
    //       } else if (decimalPart.trim() === "SEPT") {
    //         decimalInWords = "SOIXANTE-DIX CENTIMES";
    //       } else if (decimalPart.trim() === "HUIT") {
    //         decimalInWords = "QUATRE-VINGTS CENTIMES";
    //       } else if (decimalPart.trim() === "NEUF") {
    //         decimalInWords = "QUATRE-VINGT-DIX CENTIMES";
    //       } else {
    //         // decimalInWords =decimalPart + " CENTIMES";
    //         decimalInWords = decimalPart;
    //       }

    //       // res += " ET " + decimalInWords;
    //     }
    //   } else {
    //     res = to_words;
    //   }

    //   return res;
    // };

    console.log("printData:", printData);
    let nom = printData.header[0].nom;

    printData.body.forEach((line, index) => {
      trdata += `
              <tr>
                <td class="tdorder">${index + 1}</td>
                <td class="tdorder">${line.CODEDOCUTIL}</td>
                <td class="tdorder">${line.DateDouc ? line.DateDouc : ""}</td>
                <td class="tdorder montant">${numberWithSpaces(
                  line.NETAPAYER
                )}</td>
              </tr>
        `;
    });

    html = `
    <!doctype html>
    <html>
      <head>
          <style>
              .container {
                height : 29,4cm;
                width : 21cm;
                padding: 2.1cm 2.1cm 0.7cm 2.1cm;
                display: flex;
                flex-direction: column;
                font-family: Calibri, sans-serif;
                font-size :16px;
              }
              .logo {
                width: 10%;
                margin-bottom : 10px;
              }
              .date {
                font-size: 16px;
                font-weight: 900;
              }
              .discription {
                font-size: 16px;
              }

              .table {
                width: 100%;
                display: flex;
                justify-content: center;
              }
              table {
                width: 90%;
                align-self: center;
              }
              .torder,
              .thorder,
              .tdorder {
                border: 1px solid black;
                border-collapse: collapse;
                text-align: center;
                padding: 0px 32px;

              }
              .tdorder{
                padding : 10px 0px;
                font-size :4 px
              }
              th  {
                font-size : 16px;
                background : #878787;
              }
              td {
                text-align: center;
                padding: 2px 0;
              }
              .footer {
                width: 21cm;
                position: fixed;
                bottom:0;
                text-align : center;
                font-size : 18px;
              }
              .montant {
                padding :0px 10px;
                text-align: right;
              }
              .datalist {
                border: 0;
                background-color: #fafafb;
                font-size: 12px;
                text-align: center;
              }
          </style>
      </head>
      <body>
        <div class="container">
          <div>
            <img class="logo" src="./logo.png" alt="atner logo" />
          </div>
          <hr />
          <div class="date">
            <p dir="rtl">
              Rabat le &emsp;
              ${today}
            </p>
            <p dir="rtl">
              Attestation  ${printData.header[0].type} N° ${
      printData.header[0].numerocheque
    }
              <br/>Bank : ${printData.header[0].bank}
            </p>
            <p>Objet: Autorisation d'élaboration de : ${
              printData.header[0].type
            } </p>
          </div>
        <p>&emsp;&emsp;N° <b>${printData.header[0].numerocheque}</b> :
        </p>
        <div class="table">
          <table class="torder">
            <thead>
              <tr>
                <th class="thorder">Type</th>
                <th class="thorder">Bank</th>
                <th class="thorder">N° ${printData.header[0].type}</th>
                <th class="thorder">Date ${printData.header[0].type}</th>
                <th class="thorder">Date Echeance</th>
                <th class="thorder">Bénéficiaire</th>
              </tr>
            </thead>
              <tbody>
                <tr>
                  <td class="tdorder">${printData.header[0].type}</td>
                  <td class="tdorder">${printData.header[0].bank}</td>
                  <td class="tdorder">${printData.header[0].numerocheque}</td>
                  <td class="tdorder">${printData.header[0].datecheque}</td>
                  <td class="tdorder">${printData.header[0].dateecheance}</td>
                  <td class="tdorder">${printData.header[0].fournisseur}</td>
                </tr>
              </tbody>
          </table>
        </div>
        <br/>
        <br/>
        <div class="table">
          <table class="torder">
            <thead>
              <tr>
                <th class="thorder">N°</th>
                <th class="thorder">N° Document</th>
                <th class="thorder">Date Document</th>
                <th class="thorder">Net A payer</th>
              </tr>
            </thead>
            <tbody>
            ${trdata}
            </tbody>
            <tfoot>
              <th class="thorder">Total</th>
              <th colspan="2" class="thorder ">
                ${
                  // wordToNumber(parseFloat(printData.resulsumvirement))
                  toUpper(
                    toWords.convert(
                      parseFloat(printData.resulsumvirement.replace(",", "."))
                    )
                  )
                } 
              </th>
              <th class="thorder montant">${numberWithSpaces(
                printData.header[0].totalformater
              )}</th>
            </tfoot>
          </table>
        </div>
        <div class="discription">
          <p>Salutations distinguées</p>
          <b>
            <p>Le Directeur Général <br/>
              Youness ZAMANI
            </p>
          </b>
        </div>
        <div class="footer">
          <p>S.A.R.L. au capital social 100.000.000,00 DH
          <br/>Siége social : 24, route du sud, MIDELT
          <br/> R.C. Midelt n°479-Patente n°18906900-I.F n° : 04150014-C.N.S.S n° 1280510
          </p>
        </div>
      </div>
      </body>
      </html>
    `;

    fs.writeFileSync(`${__dirname}\\assets\\ordervirment.html`, html);

    let file = { url: `${__dirname}\\assets\\ordervirment.html` };
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      console.log("PDF Buffer:-", pdfBuffer);
      printData.base64 = pdfBuffer.toString("base64");
      let pdfPath =
        "\\\\10.200.1.21\\02_Exe\\00 - Reporting\\11 - Scripts Traitements Compta\\Cheque\\" +
        `${printData.header[0].type} - ${printData.header[0].numerocheque} - ${printData.header[0].bank}` +
        ".pdf";
      fs.writeFileSync(pdfPath, pdfBuffer);
      printData.path = pdfPath;
      printData.edit = true;
      // console.log(printData);
      console.log("fin", __dirname);
      res.set("Content-Range", `ordervirement 0 - 1/1`);
      res.json(printData);
    });
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
