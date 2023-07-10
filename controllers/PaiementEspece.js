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
    select sum(TTC) as netapayer from [dbo].[Daf_facture_fusion]
	  where MontantFacture is null
    and id in ('${facturelistString}')
        UNION ALL
	  select sum(MontantFacture) as netapayer from [dbo].[Daf_facture_fusion]
    where MontantFacture is not null
    and id in ('${facturelistString}')
    ) sum `);
    const pool = await getConnection();
    const result = await pool.request()
      .query(` SELECT   SUM(netapayer)  as Totale
  FROM(
    select sum(TTC) as netapayer from [dbo].[Daf_facture_fusion]
	  where MontantFacture is null
    and id in ('${facturelistString}')
        UNION ALL
	  select sum(TTC) as netapayer from [dbo].[Daf_facture_fusion]
    where MontantFacture is not null
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
    async ({ CODEDOCUTIL, chantier, nom, LIBREGLEMENT, DateFacture, TTC, HT, MontantTVA, NETAPAYER, id }, i)=> {
      const escapedNom = nom?.replaceAll(/'/g, "''");
      i != ArrayOfFacture.length - 1
        ? (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}','${DateFacture}','${TTC}','${DateFacture === null ? 0 : HT}','${DateFacture === null ? 0 : MontantTVA}','${DateFacture === null ? 0 : NETAPAYER}','${orderVirementId}','Reglee','paiement espece','${DateFacture === null ? id : 0}'),`)
        : (query += `('${CODEDOCUTIL}','${chantier}','${escapedNom}','${LIBREGLEMENT}','${DateFacture}','${TTC}','${DateFacture === null ? 0 : HT}','${DateFacture === null ? 0 : MontantTVA}','${DateFacture === null ? 0 : NETAPAYER}','${orderVirementId}','Reglee','paiement espece','${DateFacture === null ? id : 0}')`);
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
      .query(cheque.updateLogFactureWhenAnnuleV);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

exports.getVirementCount = async (req, res, next) => {
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
   
    if (filter.fournisseur) {
      queryFilter += ` and upper(f.nom) like(upper('%${filter.fournisseur}%'))`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and f.CodeFournisseur like('%${filter.CodeFournisseur}%')`;
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
      .query(espece.update);
    if (Etat === "Annuler") {
      MiunsFromTotalOv(montantVirement, orderVirementId);
      updateLogFactureWhenAnnuleVirement(orderVirementId, nom);
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
      .query(espece.getOne);

    res.set("Content-Range", `virement 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.createVirements = async (req, res) => {
  let { facturelist } = req.body;
  let { Totale } = await calculSumFactures(facturelist);
  let ArrayOfFacture = await getFactureFromView(facturelist);

  console.log(req.body, Totale);
  console.log("virement", espece.create);
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("fournisseurId", getSql().Int, req.body.fournisseurId)   
      .input("montantVirement", getSql().Float, Totale)
      .query(espece.create);
   
    insertFactureInLog(ArrayOfFacture, req.body.orderVirementId);
    res.json({ id: "" });
  } catch (error) {
    switch (error.originalError.info.number) {
      case 547:
        error.message = "vous avez dépassé le plafond de paiement";
        res.status(500).send(error.message);
        break;
      default:
        res.status(500).send(error.message);
    }
    console.log(error.message);
  }
};
