const { getConnection, getSql } = require("../database/connection");
const {  cheque } = require("../database/querys");

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

async function insertFactureInLog(ArrayOfFacture, ModePaiementID,numerocheque) {
  let query = ` `;
  ArrayOfFacture.forEach(
    async ({CODEDOCUTIL, chantier, nom, LIBREGLEMENT, DateFacture, TTC, HT, MontantTVA, MontantAPaye, id ,RAS  }, i)=> {
      const escapedNom = nom?.replaceAll(/'/g, "''");
      const formattedDate = DateFacture ? new Date(DateFacture).toISOString().slice(0, 10) : 'NULL';

      i != ArrayOfFacture.length - 1
        ? (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${DateFacture === null ? 'null' : "'" +formattedDate+"'"},'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement cheque','${DateFacture === null ? id : 0}','${numerocheque}','${RAS}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}',${DateFacture === null ? 'null' : "'" +formattedDate+"'"},'${TTC}','${HT}','${MontantTVA}','${MontantAPaye}','${ModePaiementID}','paiement cheque','${DateFacture === null ? id : 0}','${numerocheque}','${RAS}')`);
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
// async function insertAvanceInRestit(ArrayOfFacture,numerocheque,Redacteur) {
//   let query = ` `;
//   ArrayOfFacture.forEach(
//     async ({ MontantAPaye, id ,RAS }, i)=> {
//       const Montantglobal=MontantAPaye+RAS  
//     const idInt=id.substring(2,id.length);
//       i != ArrayOfFacture.length - 1
//         ? (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${nom}','${numerocheque}'),`)
//         : (query += `('${idInt}','${Montantglobal}','${Redacteur}','En Cours','${nom}','${numerocheque}')`);
   
//       }
//   );
//   console.log(`${cheque.createRestit} '${query}'`);
//   console.log(`${query}`);
//   try {
//     const pool = await getConnection();
//     const result = await pool
//       .request()
//       .query(`${cheque.createRestit}${query}`);
//   } catch (error) {
//     console.error(error.message);
//   }
// }



async function insertDocInRas(ArrayOfFacture, numerocheque) {
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

      const queryPart = `('${idFournisseur}', '${CODEDOCUTIL}', ${formattedCatFn}, ${formattedDateFacture}, '${HT}', '${MontantTVA}', '${TVA}', '${RAS}', '${PourcentageRas}', '${numerocheque}', '${escapedNom}')`;

      query += (query ? ',' : '') + queryPart;
      autorise = true;
    }
  }

  if (autorise) {
    try {
      const fullQuery = `${cheque.CreateRasFactue} ${query}`;
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




async function updateRasWhenAnnule(numerocheque) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)
     
      .query(cheque.updateRasWhenAnnule);

      console.log(`${cheque.u}` + "ma requete")
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateLogFactureWhenAnnuleCheque(numerocheque) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque) 
      .query(cheque.updateLogFactureWhenAnnuleV);

      console.log(`${cheque.updateLogFactureWhenAnnuleV}` + "ma requete")
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

      console.log(`${cheque.updateRestitWhenAnnuleCheque}` + "ma requete")
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function updateLogFactureWhenRegleecheque(numerocheque) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("numerocheque", getSql().VarChar, numerocheque)
     
      .query(cheque.updateLogFactureWhenRegleeV);

    
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



async function updateRasWhenRegleecheque(numerocheque,dateOperation) {
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
  insertFactureInLog(ArrayOfFacture,req.body.RibAtner,req.body.numerocheque);
  insertDocInRas(ArrayOfFacture, req.body.numerocheque)
  // insertAvanceInRestit(ArrayOfFacture,req.body.numerocheque,req.body.Redacteur)
  
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
   console.log(error.message)
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
  const {  dateOperation,Etat,numerocheque } =
    req.body;

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
        updateRestitWhenAnnuleCheque(numerocheque)
      }
      if (Etat === "Reglee") {
        updateLogFactureWhenRegleecheque(numerocheque);
        updateRasWhenRegleecheque(numerocheque,dateOperation);
        updateRestitWhenRegleecheque(numerocheque)
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
