const { getConnection, getSql } = require("../database/connection");
const { virements } = require("../database/VirementQuery");

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
        `${virements.getDataFromLogFacture} and id in('${facturelistString}')`
      );
    console.log(
      "get",
      `${virements.getDataFromLogFacture} and id in('${facturelistString}')`
    );
    return result.recordset;
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
  // if (query === "" && id.startsWith("fr")) {
  //   throw new Error("Aucun ID valide trouvé commençant par 'Av'");
  // }
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

async function insertFactureInLog(ArrayOfFacture, orderVirementId) {
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
        ? (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${null}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','paiement virement','${
            DateFacture === null ? id : 0
          }','${RAS}','${id}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${null}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','paiement virement','${
            DateFacture === null ? id : 0
          }','${RAS}','${id}')`);
    }
  );
  console.log(`${virements.createLogFacture} '${query}'`);
  console.log(`${query}`);
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${virements.createLogFacture}${query}`);
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

  console.log(`${virements.createRestit} '${query}'`);
  console.log(`${query}`);

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${virements.createRestit}${query}`);
  } catch (error) {
    console.error(error.message);
  }
}

async function insertDocInRas(ArrayOfFacture, orderVirementId) {
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

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, '${HT}', '${MontantTVA}', '${TVA}', '${RAS}', '${PourcentageRas}', '${orderVirementId}', '${escapedNom}')`;

      query += (query ? "," : "") + queryPart;
      autorise = true;
    }
  }

  if (autorise) {
    try {
      const fullQuery = `${virements.CreateRasFactue} ${query}`;
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

async function AddToTotalOv(number, id) {
  try {
    // let num = MontantFixed(number);

    const pool = await getConnection();
    const result = await pool
      .request()
      // .input("montantVirement", getSql().Numeric, number)
      // .input("id", getSql().VarChar, id)
      .query(
        `update [DAF_Order_virements] set total += ${number} where id ='${id}'`
      );
    console.log(
      `update [DAF_Order_virements] set total += ${number} where id ='${id}'`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function MiunsFromTotalOv(number, id) {
  try {
    // let num = MontantFixed(number);
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(
        `update [DAF_Order_virements] set total -=${number} where id ='${id}'`
      );
    console.log(
      `update [DAF_Order_virements] set total -=${number} where id ='${id}'`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateLogFactureWhenRegleevirement(
  orderVirementId,
  nom,
  dateOperation
) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)
      .input("nom", getSql().VarChar, nom)
      .input("dateOperation", getSql().Date, dateOperation)

      .query(virements.updateLogFactureWhenRegleeV);

    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateLogFactureWhenAnnuleVirement(orderVirementId, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)
      .input("nom", getSql().VarChar, nom)
      .query(virements.updateLogFactureWhenAnnuleV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateRestitWhenAnnuleVirement(orderVirementId, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)
      .input("nom", getSql().VarChar, nom)
      .query(virements.updateRestitWhenAnnuleV);

    console.log(
      `${virements.updateRestitWhenAnnuleV} '${orderVirementId}' , '${nom}'`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateOrderVirementwhenVRegler(orderVirementId) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)

      .query(virements.updateOrderVirementwhenVRegler);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateRasWhenAnnuleVirement(orderVirementId, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)
      .input("nom", getSql().VarChar, nom)
      .query(virements.updateRasWhenAnnuleV);
    console.log(
      `${virements.updateRestitWhenAnnuleV} '${orderVirementId}' , '${nom}'`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateRasWhenReglerVirement(
  orderVirementId,
  nom,
  dateOperation
) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)
      .input("nom", getSql().VarChar, nom)
      .input("dateOperation", getSql().Date, dateOperation)
      .query(virements.updateRasWhenV);

    console.log(
      `${virements.updateRasWhenReglerV} '${orderVirementId}'  '${nom}'`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateRestiWhenReglerVirement(orderVirementId, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)
      .input("nom", getSql().VarChar, nom)

      .query(virements.updateRestitwhenVRegler);

    console.log(
      `${virements.updateRestitwhenVRegler} '${orderVirementId}'  '${nom}'`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function ChangeEtatReglerAvanceFacture(orderVirementId, nom) {
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
          AND ModePaiement = @orderVirementId
          AND nom = @nom
      )
      AND etat NOT IN ('AnnulerSasie')
    `;

    // Requête 2 : Mise à jour de DAF_FactureSaisie
    let query2 = `
   UPDATE  fs
SET  fs.AcompteVal += rs.Montant
FROM DAF_FactureSaisie fs
INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
WHERE rs.ModePaiement = @orderVirementId
  AND rs.nom = @nom
  AND rs.Etat  IN ('Reglee');

    `;

    // Préparation des requêtes
    const request1 = pool.request();
    request1.input("orderVirementId", orderVirementId);
    request1.input("nom", nom);

    const request2 = pool.request();
    request2.input("orderVirementId", orderVirementId);
    request2.input("nom", nom);

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

async function ChangeEtatAnnulerAvanceFacture(orderVirementId, nom) {
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
          AND ModePaiement = @orderVirementId
          AND nom = @nom
      )
      AND etat NOT IN ('AnnulerSasie')
    `;

    // Requête 2 : Mise à jour de DAF_FactureSaisie
    let query2 = `
   UPDATE  fs
SET  fs.AcompteReg -= rs.Montant
FROM DAF_FactureSaisie fs
INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
WHERE rs.ModePaiement = @orderVirementId
  AND rs.nom = @nom
  AND rs.Etat  IN ('AnnulerPaiement');

    `;

    // Préparation des requêtes
    const request1 = pool.request();
    request1.input("orderVirementId", orderVirementId);
    request1.input("nom", nom);

    const request2 = pool.request();
    request2.input("orderVirementId", orderVirementId);
    request2.input("nom", nom);

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

exports.getVirementCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(virements.getCount);
    req.count = result.recordset[0].count;
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.createVirements = async (req, res) => {
  let { facturelist } = req.body;
  let { Totale } = await calculSumFactures(facturelist);
  //let num = MontantFixed(Totale);
  let ArrayOfFacture = await getFactureFromView(facturelist);
  insertFactureInLog(ArrayOfFacture, req.body.orderVirementId);
  insertDocInRas(ArrayOfFacture, req.body.orderVirementId);
  insertAvanceInRestit(
    ArrayOfFacture,
    req.body.orderVirementId,
    req.body.Redacteur
  );
  ChangeEtatEnCoursAvance(ArrayOfFacture);
  console.log(req.body, Totale);
  console.log("ArrayOfFacture", ArrayOfFacture);
  console.log("virement", virements.create);
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Redacteur", getSql().VarChar, req.body.Redacteur)
      .input("orderVirementId", getSql().VarChar, req.body.orderVirementId)
      .input("fournisseurId", getSql().Int, req.body.fournisseurId)
      .input("ribFournisseurId", getSql().Int, req.body.ribFournisseurId)
      .input("montantVirement", getSql().Float, Totale)
      .query(virements.create);
    console.log(Totale);
    await AddToTotalOv(Totale, req.body.orderVirementId);
    res.json({ id: "", Totale });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getVirements = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";
    if (filter.orderVirementId) {
      queryFilter += ` and upper(orderVirementId) like(upper('%${filter.orderVirementId}%'))`;
    }
    if (filter.nom) {
      queryFilter += ` and upper(f.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.rib) {
      queryFilter += ` and rf.rib like('%${filter.rib}%')`;
    }
    if (filter.Etat) {
      queryFilter += ` and upper(v.Etat) like(upper('%${filter.Etat}%'))`;
    }

    console.log(queryFilter);

    const pool = await getConnection();
    const result = await pool.request().query(
      `${virements.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `virement ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateVirmeents = async (req, res) => {
  console.log(req.body);
  const { montantVirement, Etat, orderVirementId, nom, dateOperation } =
    req.body;
  if (montantVirement == null || orderVirementId == null || nom == null) {
    return res.status(400).json({ error: "all fields are required!" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("etat", getSql().VarChar, Etat)
      .input("dateOperation", getSql().Date, dateOperation)
      .input("id", getSql().Int, req.params.id)
      .query(virements.update);
    if (Etat === "Annuler") {
      MiunsFromTotalOv(montantVirement, orderVirementId);
      updateLogFactureWhenAnnuleVirement(orderVirementId, nom);
      updateRasWhenAnnuleVirement(orderVirementId, nom);
      updateRestitWhenAnnuleVirement(orderVirementId, nom);
      ChangeEtatAnnulerAvanceFacture(orderVirementId, nom);
    }
    if (Etat === "Reglee") {
      updateRasWhenReglerVirement(orderVirementId, nom, dateOperation);
      updateOrderVirementwhenVRegler(orderVirementId);
      updateRestiWhenReglerVirement(orderVirementId, nom);
      updateLogFactureWhenRegleevirement(orderVirementId, nom, dateOperation);
      ChangeEtatReglerAvanceFacture(orderVirementId, nom);
    }

    res.json({
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneVirementById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(virements.getOne);

    res.set("Content-Range", `virement 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.CheckedFournisseurDejaExiste = async (req, res) => {
  try {
    const pool = await getConnection(); // Assurez-vous que getConnection retourne une instance de pool de connexion

    const result = await pool
      .request()
      .input("ribFournisseurId", getSql().Int, req.params.ribFournisseurId)
      .query(virements.CheckedFournisseurDejaExiste);

    res.set("Content-Range", `virement 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête :", error);
    res.status(500).send(error.message);
  }
};
