const { virementsInter } = require("../database/VirementInterQuery");
const { getConnection, getSql } = require("../database/connection");

const MontantFixed = (num) => {
  return parseFloat(num.toFixed(2));
};

async function calculSumFactures(facturelist) {
  let facturelistString = facturelist.join("','");

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`SELECT SUM(MontantTTCDevise) as Totale 
              FROM [dbo].[DAF_FactureDevise]
              WHERE id IN ('${facturelistString}')`);
    return result.recordset[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function getFactureDetails(facturelist) {
  let facturelistString = facturelist.join("','");

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`SELECT * FROM [dbo].[DAF_FactureDevise] 
              WHERE id IN ('${facturelistString}')`);
    return result.recordset;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function insertFactureInLog(ArrayOfFacture, virementInterId) {
  let query = ``;

  console.log(ArrayOfFacture, virementInterId);

  ArrayOfFacture.forEach((facture, index) => {
    const escapedNom = facture.nom?.replace(/'/g, "''");
    log;
    query += `(${facture.id}, ${facture.idFournisseur}, '${escapedNom}', ${virementInterId}, 
              ${facture.MontantTTCDevise}, ${facture.MontantTTCDevise}, 'En cours', 
              'virement inter', getdate())`;

    if (index !== ArrayOfFacture.length - 1) {
      query += ",";
    }
  });
  console.log(query);

  try {
    const pool = await getConnection();
    await pool.request().query(`${virementsInter.createLog} ${query}`);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

exports.getVirementInterCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(virementsInter.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createVirementInter = async (req, res) => {
  try {
    const { facturelist } = req.body;
    const { Totale } = await calculSumFactures(facturelist);
    const ArrayOfFacture = await getFactureDetails(facturelist);

    // console.log(req.body);

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("fournisseurId", getSql().Int, req.body.fournisseurId)
      .input("ribFournisseurId", getSql().Int, req.body.ribFournisseurId)
      .input(
        "interOrderVirementId",
        getSql().VarChar,
        req.body.interOrderVirementId
      )
      .input("montantDevise", getSql().Float, Totale)
      .input("Redacteur", getSql().VarChar, req.body.Redacteur)
      .query(virementsInter.create);

    // Insert factures into log
    await insertFactureInLog(ArrayOfFacture, result.recordset[0].id);

    res.json({
      id: result.recordset[0].id,
      Totale,
      message: "International wire transfer created successfully",
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getVirementsInter = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.interOrderVirementId) {
      queryFilter += ` and upper(interOrderVirementId) like(upper('%${filter.interOrderVirementId}%'))`;
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

    const pool = await getConnection();
    const result = await pool.request().query(
      `${virementsInter.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `virementInter ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateVirementInter = async (req, res) => {
  const { montantDevise, Etat, interOrderVirementId, nom, DateOperation } =
    req.body;

  if (!montantDevise || !interOrderVirementId || !nom) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("Etat", getSql().VarChar, Etat)
      .input("DateOperation", getSql().Date, DateOperation)
      .input("id", getSql().Int, req.params.id)
      .query(virementsInter.update);

    // Update log status based on operation
    if (Etat === "Annuler") {
      await pool
        .request()
        .input("interOrderVirementId", getSql().VarChar, interOrderVirementId)
        .input("nom", getSql().VarChar, nom)
        .query(virementsInter.updateLogWhenAnnule);
    } else if (Etat === "Reglee") {
      await pool
        .request()
        .input("interOrderVirementId", getSql().VarChar, interOrderVirementId)
        .input("nom", getSql().VarChar, nom)
        .input("dateOperation", getSql().Date, DateOperation)
        .query(virementsInter.updateLogWhenReglee);
    }

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getOneVirementInterById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(virementsInter.getOne);

    res.set("Content-Range", `virementInter 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.CheckedFournisseurDejaExisteInter = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("ribFournisseurId", getSql().Int, req.params.ribFournisseurId)
      .query(virementsInter);

    res.set("Content-Range", `virementInter 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
