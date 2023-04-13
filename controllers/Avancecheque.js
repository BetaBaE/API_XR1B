const { getConnection, getSql } = require("../database/connection");
const {  cheque, avancecheque } = require("../database/querys");

const MontantFixed = (num) => {
  return parseFloat(num.toFixed(2));
};

async function calculSumFactures(facturelist) {
    let facturelistString = facturelist.join("','");

    console.log(facturelist.join("','"));
    try {
        console.log(`SELECT  SUM(netapayer) as Totale
  FROM(
    select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
	  where montantAvance is not null
    and id in ('${facturelistString}')
        UNION ALL
	  select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
    where montantAvance is not null
    and id in ('${facturelistString}')
    ) sum `);
        const pool = await getConnection();
        const result = await pool.request()
            .query(` SELECT   SUM(netapayer)  as Totale
  FROM(
    select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
	  where montantAvance is not null
    and id in ('${facturelistString}')
        UNION ALL
	  select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
    where montantAvance is not null
    and id in ('${facturelistString}')
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
        `${avancecheque.getDataFromLogFacture} and id in('${facturelistString}')`
      );
    console.log(
      "test",
      `${avancecheque.getDataFromLogFacture} and id in('${facturelistString}')`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function insertFactureInLog(ArrayOfFacture, orderVirementId) {
    let query = ` `;
    ArrayOfFacture.forEach(
        ({
                CODEDOCUTIL,
                chantier,
                nom,
                LIBREGLEMENT,
                DateFacture,
                TTC,
                HT,
                MontantTVA,
                montantAvance,
                id
            },
            i
        ) => {
            i != ArrayOfFacture.length - 1 ?
                (query += `('${CODEDOCUTIL}','${chantier}','${nom}','${LIBREGLEMENT}','${DateFacture}','${0}','${0}','${0}','${montantAvance}','${orderVirementId}','${id}','avance virement' ),`) :
                (query += `('${CODEDOCUTIL}','${chantier}','${nom}','${LIBREGLEMENT}','${DateFacture}','${0}','${0}','${0}','${montantAvance}','${orderVirementId}','${id}','avance virement')`);
        }
    );
    console.log(`${avancecheque.createLogFacture} '${query}'`);
    console.log(`${query}`);
    try {
        const pool = await getConnection();
        const result = await pool
            .request()
            .query(`${avancecheque.createLogFacture}${query}`);
    } catch (error) {
        console.error(error.message);
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
        `update [DAF_Order_virements] set total = total+${number} where id ='${id}'`
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
        `update [DAF_Order_virements] set total = total-${number} where id ='${id}'`
      );
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
      .query(avancecheque.updateLogFactureWhenAnnuleV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

exports.getVirementCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(avancecheque.getCount);
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
  // console.log(req.body);
  let { facturelist } = req.body;
  let { Totale } = await calculSumFactures(facturelist);
  //let num = MontantFixed(Totale);
  let ArrayOfFacture = await getFactureFromView(facturelist);
  insertFactureInLog(ArrayOfFacture, req.body.orderVirementId);
  console.log(req.body, Totale);
  console.log("virement", avancecheque.create);
  try {
    const pool = await getConnection();
    const result = await pool
      .request()

      .input("orderVirementId", getSql().Int, req.body.orderVirementId)
      .input("fournisseurId", getSql().Int, req.body.fournisseurId)
    
      .input("montantVirement", getSql().Float, Totale)

      .input("numerocheque", getSql().Char, req.body.numerocheque)
      .input("datecheque", getSql().Date, req.body.datecheque)
    
      .input("dateecheance", getSql().Date, req.body.dateecheance)
      .query(avancecheque.create);

    res.json({ id: "" });
  } catch (error) {
   console.log(error.message)
    res.send(error.message);
    res.status(500);
  }
  // return res.json([{ id: "id" }]);
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
      `${avancecheque.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
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
  const {  dateOperation } =
    req.body;
 
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("dateOperation", getSql().Date, dateOperation)
      .input("id", getSql().Int, req.params.id)
      .query(avancecheque.update);
  
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
      .query(avancecheque.getOne);

    res.set("Content-Range", `virement 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
