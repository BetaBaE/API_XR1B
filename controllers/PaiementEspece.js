const { trim } = require("lodash");
const { getConnection, getSql } = require("../database/connection");
const { espece } = require("../database/querys");


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
    async ({ CODEDOCUTIL, chantier, nom, LIBREGLEMENT, DateFacture, TTC, HT, MontantTVA, MontantAPaye, id ,RAS}, i)=> {
      const escapedNom = nom?.replaceAll(/'/g, "''");
      const formattedDate = DateFacture ? new Date(DateFacture).toISOString().slice(0, 10) : 'NULL';

      i != ArrayOfFacture.length - 1
        ? (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${DateFacture === null ? 'null' : "'" +formattedDate+"'"},'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','Reglee','paiement espece','${DateFacture === null ? id : 0}','${RAS}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${DateFacture === null ? 'null' : "'" +formattedDate+"'"},'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','Reglee','paiement espece','${DateFacture === null ? id : 0}','${RAS}')`);
   
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



// async function insertAvanceInRestit(ArrayOfFacture,Redacteur) {
//   let query = ` `;
//   ArrayOfFacture.forEach(
//     async ({ MontantAPaye, id ,RAS , nom }, i)=> {
//       const Montantglobal=MontantAPaye+RAS  
//     const idInt=id.substring(2,id.length);
//       i != ArrayOfFacture.length - 1
//         ? (query += `('${idInt}','${Montantglobal}','${Redacteur}','Regler','${nom}','espece'),`)
//         : (query += `('${idInt}','${Montantglobal}','${Redacteur}','Regler','${nom}','espece')`);
   
//       }
//   );
//   console.log(`${espece.createRestit} '${query}'`);
//   console.log(`${query}`);
//   try {
//     const pool = await getConnection();
//     const result = await pool
//       .request()
//       .query(`${espece.createRestit}${query}`);
//   } catch (error) {
//     console.error(error.message);
//   }
// }








async function insertDocInRas(ArrayOfFacture) {
  let query = '';
  let autorise = false;

  for (const { idFournisseur, CODEDOCUTIL, CatFn, nom, DateFacture, HT, MontantTVA, RAS, TVA } of ArrayOfFacture) {
    console.log("RAS", RAS);
    if (RAS != 0) {
      const escapedNom = nom?.replace(/'/g, "''");
      const formattedDate = DateFacture ? new Date(DateFacture).toISOString().slice(0, 10) : null;
      const PourcentageRas = Math.round((RAS / MontantTVA) * 100);

      const formattedDateFacture = formattedDate === null ? 'NULL' : `'${formattedDate}'`;
      const formattedCatFn = CatFn === null ? 'NULL' : `'${CatFn}'`;

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, ${formattedDateFacture},'Regler', '${HT}', '${MontantTVA}', '${TVA}', '${RAS}', '${PourcentageRas}', 'paiement espece', '${escapedNom}')`;

      query += (query ? ',' : '') + queryPart;
      autorise = true;
    }
  }

  if (autorise) {
    try {
      const fullQuery = `${espece.CreateRasFactue} ${query}`;
      console.log('fullQuery', fullQuery);

      // Assuming you have a pool object available to get the connection
      const pool = await getConnection();
      const result = await pool.request().query(fullQuery);

      console.log('Insert successful', result);
    } catch (error) {
      console.error('Error executing query:', error);
    }
  }
}



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
      `ribFournisseur ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

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
      // insertAvanceInRestit(ArrayOfFacture,req.body.redacteur)
    insertFactureInLog(ArrayOfFacture);
    insertDocInRas(ArrayOfFacture)
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
