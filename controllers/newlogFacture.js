const { getConnection, getSql } = require("../database/connection");
const { logfacture } = require("../database/newlogFacture");

exports.GetFactureDetails = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";

    if (filter.nom) {
      queryFilter += ` and upper(fo.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.codechantier) {
      queryFilter += ` and codechantier like(upper('%${filter.codechantier}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` and  upper(fs.numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.DateFacture) {
      queryFilter += ` and  fs.DateFacture ='${filter.DateFacture}' `;
    }
    if (filter.Etat) {
      queryFilter += ` and  upper(fs.Etat) like(upper('%${filter.Etat}%'))`;
    }
    if (filter.modepaiement) {
      queryFilter += ` and  upper(fs.modepaiement) like(upper('%${filter.modepaiement}%'))`;
    }
    if (filter.RefPay) {
      queryFilter += ` and  upper(fs.modepaiementID) like(upper('%${filter.RefPay}%'))`;
    }

    if (filter.DateOperation) {
      queryFilter += ` and  fs.DateOperation ='${filter.DateOperation}' `;
    }
    if (filter.Bank) {
      queryFilter += ` and  upper(ra.nom) like(upper('%${filter.Bank}%'))`;
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("dateExercices", getSql().VarChar, filter.dateExercices).query(`
    ${logfacture.GetFactureDetails} 
    ${queryFilter} 
    ORDER BY ${sort[0]} ${sort[1]} 
    OFFSET ${range[0]} ROWS 
    FETCH NEXT ${range[1] - range[0]} ROWS ONLY

    `);
    /**
 *     
    
 */
    console.log(req.count);
    res.set(
      "Content-Range",
      `newlogfacture ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

/* 
   lister le nombre des attestations 
   cette fonction  nous aide dans la pagination
   */

exports.GetFactureDetailsCount = async (req, res, next) => {
  try {
    let filter = req.query.filter || "{}";
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.nom) {
      queryFilter += ` and upper(fo.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.codechantier) {
      queryFilter += ` and codechantier like(upper('%${filter.codechantier}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` and  upper(fs.numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.DateFacture) {
      queryFilter += ` and  fs.DateFacture ='${filter.DateFacture}' `;
    }
    if (filter.Etat) {
      queryFilter += ` and  upper(fs.Etat) like(upper('%${filter.Etat}%'))`;
    }
    if (filter.modepaiement) {
      queryFilter += ` and  upper(fs.modepaiement) like(upper('%${filter.modepaiement}%'))`;
    }
    if (filter.RefPay) {
      queryFilter += ` and  upper(fs.modepaiementID) like(upper('%${filter.RefPay}%'))`;
    }

    if (filter.DateOperation) {
      queryFilter += ` and  fs.DateOperation ='${filter.DateOperation}' `;
    }
    if (filter.Bank) {
      queryFilter += ` and  upper(ra.nom) like(upper('%${filter.Bank}%'))`;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("dateExercices", getSql().VarChar, filter.dateExercices)
      .query(`${logfacture.GetFactureDetailsCount} ${queryFilter} `);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
