const { trim } = require("lodash");
const { getConnection, getSql } = require("../database/connection");
const { espece } = require("../database/EspeceQuery");
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
        `${espece.getDataFromLogFacture} and id in('${facturelistString}')`
      );
    console.log(
      "test",
      `${espece.getDataFromLogFacture} and id in('${facturelistString}')`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
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

      const GetDateFormated = new Date().toISOString().slice(0, 10);
      i != ArrayOfFacture.length - 1
        ? (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','Reglee','paiement espece','${
            DateFacture === null ? id : 0
          }','${RAS}','${id}', '${
            DateFacture === null ? GetDateFormated : DateFacture
          }'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${
            DateFacture === null ? "null" : "'" + formattedDate + "'"
          },'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','Reglee','paiement espece','${
            DateFacture === null ? id : 0
          }','${RAS}','${id}','${
            DateFacture === null ? GetDateFormated : formattedDate
          }')`);
    }
  );
  console.log(`${espece.createLogFacture} '${query}'`);
  console.log(`${query}`);
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${espece.createLogFacture}${query}`);
  } catch (error) {
    console.error(error.message);
  }
}

async function insertAvanceInRestit(ArrayOfFacture, Redacteur) {
  let query = ``;

  ArrayOfFacture.forEach(({ MontantAPaye, id, RAS, nom, MontantRasIR }, i) => {
    // Vérifier si l'ID commence par 'Av'
    if (id.startsWith("Av")) {
      const Montantglobal = MontantAPaye + RAS + MontantRasIR;
      const idInt = id.substring(2, id.length);
      const escapedNom = nom?.replaceAll(/'/g, "''");

      i != ArrayOfFacture.length - 1
        ? (query += `('${idInt}','${Montantglobal}','${Redacteur}','Reglee','${escapedNom}','espece'),`)
        : (query += `('${idInt}','${Montantglobal}','${Redacteur}','Reglee','${escapedNom}','espece')`);
    }
  });

  // Retirer la virgule finale s'il y en a une
  query = query.endsWith(",") ? query.slice(0, -1) : query;

  console.log(`${espece.createRestit} '${query}'`);
  console.log(`${query}`);

  try {
    const pool = await getConnection();
    const result = await pool.request().query(`${espece.createRestit}${query}`);
  } catch (error) {
    console.error(error.message);
  }
}

async function insertDocInRas(ArrayOfFacture) {
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
    if (RAS != 0) {
      const escapedNom = nom?.replace(/'/g, "''");
      const formattedDate = DateFacture
        ? new Date(DateFacture).toISOString().slice(0, 10)
        : null;
      const PourcentageRas = Math.round((RAS / MontantTVA) * 100);

      const formattedDateFacture =
        formattedDate === null ? "NULL" : `'${formattedDate}'`;
      const formattedCatFn = CatFn === null ? "NULL" : `'${CatFn}'`;

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, ${formattedDateFacture},'Reglee', '${HT}', '${MontantTVA}', '${TVA}', '${RAS}', '${PourcentageRas}', 'paiement espece', '${escapedNom}', '${id}')`;

      query += (query ? "," : "") + queryPart;
      autorise = true;
    }
  }

  if (autorise) {
    try {
      const fullQuery = `${espece.CreateRasFactue} ${query}`;
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
/*
async function ChangeEtatReglerAvanceFacture(ArrayOfFacture) {
  if (!Array.isArray(ArrayOfFacture) || ArrayOfFacture.length === 0) {
    throw new Error("ArrayOfFacture doit être un tableau non vide");
  }

  let query1 = ``;
  let query2 = ``;

  try {
    const pool = await getConnection();
    ArrayOfFacture.forEach(({ id }, i) => {
      // Vérifier si l'ID commence par 'Av'
      if (id.startsWith("Av")) {
        const idInt = id.substring(2, id.length);
        // Construire la partie de la requête pour cet ID
        query1 += `UPDATE DAF_Avance
        SET Etat = 'Reglee'
        WHERE id IN (
          SELECT idavance
          FROM DAF_RestitAvance
          WHERE Etat IN ('Reglee')
        )
        AND etat NOT IN ('Annuler') AND id = '${idInt}';\n`;

        query2 += `UPDATE fs
        SET fs.AcompteVal += rs.Montant
        FROM DAF_FactureSaisie fs
        INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
        WHERE rs.idavance = '${idInt}'
        AND rs.Etat IN ('Reglee');\n`;
      }
      if (id.startsWith("fr")) {
        // throw new Error("Aucun ID valide trouvé commençant par 'Av'");
      }
    });

    // Préparation des requêtes
    const request1 = pool.request();
    const request2 = pool.request();

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
}*/

exports.getEspeceCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(espece.getCount);
    req.count = result.recordset[0].count;
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getEspece = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";

    if (filter.fournisseur) {
      queryFilter += ` and upper(f.nom) like(upper('%${filter.fournisseur}%'))`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and f.CodeFournisseur like('%${filter.CodeFournisseur}%')`;
    }
    console.log(queryFilter);

    const pool = await getConnection();
    const result = await pool.request().query(
      `${espece.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `Espece ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

async function insertDocInRasIR(ArrayOfFacture) {
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

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture},'Reglee', '${HT}', '${MontantRasIR}', 'paiement espece', '${escapedNom}', '${id}')`;

      query += (query ? "," : "") + queryPart;
      autorise = true;
    }
  }
  if (autorise) {
    try {
      const fullQuery = `${espece.CreateRasIRFacture} ${query}`;
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

exports.createEspece = async (req, res) => {
  let { facturelist } = req.body;
  let { Totale } = await calculSumFactures(facturelist);
  let ArrayOfFacture = await getFactureFromView(facturelist);

  console.log(req.body, Totale);
  console.log("virement", espece.create);
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("redacteur", getSql().VarChar, req.body.redacteur)
      .input("fournisseurId", getSql().Int, req.body.fournisseurId)
      .input("montantVirement", getSql().Float, Totale)
      .query(espece.create);
    insertAvanceInRestit(ArrayOfFacture, req.body.redacteur);
    insertFactureInLog(ArrayOfFacture);
    insertDocInRas(ArrayOfFacture);
    insertDocInRasIR(ArrayOfFacture);

    // ChangeEtatReglerAvanceFacture(ArrayOfFacture); // trigger FactureSaisie Replace this function
    res.json({ id: "" });
  } catch (error) {
    // switch (error.originalError.info.number) {
    //   case 547:
    //     error.message = "vous avez dépassé le plafond de paiement";
    //     res.status(500).send(error.message);
    //     break;
    //   default:
    //     res.status(500).send(error.message);
    // }
    console.log(error);
  }
};
