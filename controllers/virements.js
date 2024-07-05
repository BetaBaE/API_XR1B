const { getConnection, getSql } = require("../database/connection");
const { virements } = require("../database/querys");

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

async function insertFactureInLog(ArrayOfFacture, orderVirementId) {
  let query = ` `;
 
  ArrayOfFacture.forEach(
    async ({ CODEDOCUTIL, chantier, nom, LIBREGLEMENT, DateFacture, TTC, HT, MontantTVA, MontantAPaye, id ,RAS}, i) => {
      const escapedNom = nom?.replaceAll(/'/g, "''");
      const formattedDate = DateFacture ? new Date(DateFacture).toISOString().slice(0, 10) : 'NULL';

      i != ArrayOfFacture.length - 1
        ? (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${null}',${DateFacture === null ? 'null' : "'" +formattedDate+"'"},'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','paiement virement','${DateFacture === null ? id : 0}','${RAS}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${null}',${DateFacture === null ? 'null' : "'" +formattedDate+"'"},'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${orderVirementId}','paiement virement','${DateFacture === null ? id : 0}','${RAS}')`);
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

// async function insertAvanceInRestit(ArrayOfFacture,orderVirementId,Redacteur) {
//   let query = ` `;
//   ArrayOfFacture.forEach(
//     async ({ MontantAPaye, id ,RAS ,nom }, i)=> {
//       const Montantglobal=MontantAPaye+RAS  
//     const idInt=id.substring(2,id.length);
//       i != ArrayOfFacture.length - 1
//         ? (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${nom}','${orderVirementId}'),`)
//         : (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${nom}','${orderVirementId}')`);
   
//       }
//   );
//   console.log(`${virements.createRestit} '${query}'`);
//   console.log(`${query}`);
//   try {
//     const pool = await getConnection();
//     const result = await pool
//       .request()
//       .query(`${virements.createRestit}${query}`);
//   } catch (error) {
//     console.error(error.message);
//   }
// }





async function insertDocInRas(ArrayOfFacture, orderVirementId) {
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

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, '${HT}', '${MontantTVA}', '${TVA}', '${RAS}', '${PourcentageRas}', '${orderVirementId}', '${escapedNom}')`;

      query += (query ? ',' : '') + queryPart;
      autorise = true;
    }
  }

  if (autorise) {
    try {
      const fullQuery = `${virements.CreateRasFactue} ${query}`;
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
console.log( `update [DAF_Order_virements] set total += ${number} where id ='${id}'`)
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
      console.log( `update [DAF_Order_virements] set total -=${number} where id ='${id}'`)
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}


async function updateLogFactureWhenRegleevirement(idov, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      .input("nom", getSql().VarChar, nom)
     
      .query(virements.updateLogFactureWhenRegleeV);

    
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}


async function updateLogFactureWhenAnnuleVirement(idov, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      .input("nom", getSql().VarChar, nom)
      .query(virements.updateLogFactureWhenAnnuleV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}



async function updateLogFactureWhenReglerVirement(idov, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      .input("nom", getSql().VarChar, nom)
      .query(virements.updateLogFactureWhenReglerV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateRestitWhenAnnuleVirement(idov, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      .input("nom", getSql().VarChar, nom)
      .query(virements.updateRestitWhenAnnuleV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateOrderVirementwhenVRegler(idov) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      
      .query(virements.updateOrderVirementwhenVRegler);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}



async function updateRasWhenAnnuleVirement(idov, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      .input("nom", getSql().VarChar, nom)
      .query(virements.updateRasWhenAnnuleV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}


async function updateRasWhenReglerVirement(idov, nom, dateOperation) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      .input("nom", getSql().VarChar, nom)
      .input("dateOperation", getSql().Date, dateOperation)
      .query(virements.updateRasWhenReglerV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateRestiWhenReglerVirement(idov, nom) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, idov)
      .input("nom", getSql().VarChar, nom)
      
      .query(virements.updateRestitWhenReglerV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
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
  insertDocInRas(ArrayOfFacture, req.body.orderVirementId)
  // insertAvanceInRestit(ArrayOfFacture,req.body.orderVirementId,req.body.Redacteur)
  
  console.log(req.body, Totale);
  console.log("ArrayOfFacture",ArrayOfFacture)
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
            console.log(Totale)
      await AddToTotalOv(Totale, req.body.orderVirementId);
    res.json({ id: "" ,Totale});
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
      `ribFournisseur ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
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
    }
    if (Etat === "Reglee") {
      updateRasWhenReglerVirement(orderVirementId, nom,dateOperation);
      updateLogFactureWhenReglerVirement(orderVirementId, nom);
      updateOrderVirementwhenVRegler(orderVirementId);
      updateRestiWhenReglerVirement(orderVirementId, nom);
    }
    if (Etat === "Reglee") {
      updateLogFactureWhenRegleevirement(orderVirementId, nom);
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
      .input("ribFournisseurId",getSql().Int, req.params.ribFournisseurId)
      .query(virements.CheckedFournisseurDejaExiste);

    res.set("Content-Range", `virement 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête :", error);
    res.status(500).send(error.message);
  }
};