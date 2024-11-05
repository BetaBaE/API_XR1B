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
      queryFilter += ` and fs.codechantier like(upper('%${filter.codechantier}%'))`;
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
    if (filter.Fn) {
      queryFilter += ` and  fn.ficheNavette like('%${filter.Fn}%')`;
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
      queryFilter += ` and fs.codechantier like(upper('%${filter.codechantier}%'))`;
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
    if (filter.Fn) {
      queryFilter += ` and  fn.ficheNavette like('%${filter.Fn}%')`;
    }

    console.log(`${logfacture.GetFactureDetailsCount} ${queryFilter} `);
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

exports.GetAvanceDetails = async (req, res) => {
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
      queryFilter += ` and av.CodeAffaire like(upper('%${filter.codechantier}%'))`;
    }
    if (filter.BonCommande) {
      queryFilter += ` and  upper(av.BonCommande) like(upper('%${filter.BonCommande}%'))`;
    }
    if (filter.Etat) {
      queryFilter += ` and  upper(av.Etat) like(upper('%${filter.Etat}%'))`;
    }
    if (filter.modepaiement) {
      queryFilter += ` and  upper(av.modepaiement) like(upper('%${filter.modepaiement}%'))`;
    }
    if (filter.RefPay) {
      queryFilter += ` and  upper(av.modepaiementID) like(upper('%${filter.RefPay}%'))`;
    }

    if (filter.DateOperation) {
      queryFilter += ` and  av.DateOperation ='${filter.DateOperation}' `;
    }
    if (filter.Bank) {
      queryFilter += ` and  upper(ra.nom) like(upper('%${filter.Bank}%'))`;
    }
    if (filter.Fn) {
      queryFilter += ` and  fn.ficheNavette like('%${filter.Fn}%')`;
    }
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("dateExercices", getSql().VarChar, filter.dateExercices).query(`
    ${logfacture.GetAvanceDetails} 
    ${queryFilter} 
    ORDER BY ${sort[0]} ${sort[1]} 
    OFFSET ${range[0]} ROWS 
    FETCH NEXT ${range[1] - range[0]} ROWS ONLY

    `);

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

exports.GetAvanceDetailsCount = async (req, res, next) => {
  try {
    let filter = req.query.filter || "{}";
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.nom) {
      queryFilter += ` and upper(fo.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.codechantier) {
      queryFilter += ` and av.CodeAffaire like(upper('%${filter.codechantier}%'))`;
    }
    if (filter.BonCommande) {
      queryFilter += ` and  upper(av.BonCommande) like(upper('%${filter.BonCommande}%'))`;
    }

    if (filter.Etat) {
      queryFilter += ` and  upper(av.Etat) like(upper('%${filter.Etat}%'))`;
    }
    if (filter.modepaiement) {
      queryFilter += ` and  upper(av.modepaiement) like(upper('%${filter.modepaiement}%'))`;
    }
    if (filter.RefPay) {
      queryFilter += ` and  upper(av.modepaiementID) like(upper('%${filter.RefPay}%'))`;
    }
    if (filter.DateOperation) {
      queryFilter += ` and  av.DateOperation ='${filter.DateOperation}' `;
    }
    if (filter.Bank) {
      queryFilter += ` and  upper(ra.nom) like(upper('%${filter.Bank}%'))`;
    }
    if (filter.Fn) {
      queryFilter += ` and  fn.ficheNavette like('%${filter.Fn}%')`;
    }

    console.log(`${logfacture.GetFactureDetailsCount} ${queryFilter} `);
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("dateExercices", getSql().VarChar, filter.dateExercices)
      .query(`${logfacture.GetAvanceDetailsCount} ${queryFilter} `);

    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.GetTVALog = async (req, res) => {
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
      queryFilter += ` and upper(fs.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.CODECHT) {
      queryFilter += ` and  fs.CODECHT like(upper('%${filter.CODECHT}%'))`;
    }
    if (filter.CODEDOCUTIL) {
      queryFilter += ` and  upper(fs.CODEDOCUTIL) like(upper('%${filter.CODEDOCUTIL}%'))`;
    }
    if (filter.Fn) {
      queryFilter += ` and  upper(fn.ficheNavette) like(upper('%${filter.Fn}%'))`;
    }
    if (filter.modepaiement) {
      queryFilter += ` and  upper(fs.modepaiement) like(upper('%${filter.modepaiement}%'))`;
    }
    if (filter.Etat) {
      queryFilter += ` and  upper(fs.Etat) like(upper('%${filter.Etat}%'))`;
    }
    if (filter.RefPay) {
      queryFilter += `     and (upper(fs.modepaiementID) like(upper('%${filter.RefPay}%')) or upper(fs.numerocheque) like(upper('%${filter.RefPay}%')))`;
    }
    if (filter.typeDoc) {
      queryFilter += `     and upper(fs.idDocpaye) like(upper('${filter.typeDoc}%'))`;
    }
    if (filter.DateDouc) {
      queryFilter += ` and  FORMAT( DateOperation, 'yyyy-MMMM') like(upper('%${filter.DateDouc}%'))`;
    }
    const pool = await getConnection();
    console.log(`
    ${logfacture.logTva} 
    ${queryFilter} 
    ORDER BY ${sort[0]} ${sort[1]} 
    OFFSET ${range[0]} ROWS 
    FETCH NEXT ${range[1] - range[0]} ROWS ONLY

    `);

    const result =
      await // .input("dateExercices", getSql().VarChar, filter.dateExercices)
      pool.request().query(`
    ${logfacture.logTva} 
    ${queryFilter} 
    ORDER BY ${sort[0]} ${sort[1]} 
    OFFSET ${range[0]} ROWS 
    FETCH NEXT ${range[1] - range[0]} ROWS ONLY

    `);

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

exports.GetLogTvaCount = async (req, res, next) => {
  try {
    let filter = req.query.filter || "{}";
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.nom) {
      queryFilter += ` and upper(fs.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.CODECHT) {
      queryFilter += ` and  fs.CODECHT like(upper('%${filter.CODECHT}%'))`;
    }
    if (filter.CODEDOCUTIL) {
      queryFilter += ` and  upper(fs.CODEDOCUTIL) like(upper('%${filter.CODEDOCUTIL}%'))`;
    }
    if (filter.Fn) {
      queryFilter += ` and  upper(fn.ficheNavette) like(upper('%${filter.Fn}%'))`;
    }
    if (filter.modepaiement) {
      queryFilter += ` and  upper(fs.modepaiement) like(upper('%${filter.modepaiement}%'))`;
    }
    if (filter.Etat) {
      queryFilter += ` and  upper(fs.Etat) like(upper('%${filter.Etat}%'))`;
    }
    if (filter.RefPay) {
      queryFilter += `     and (upper(fs.modepaiementID) like(upper('%${filter.RefPay}%')) or upper(fs.numerocheque) like(upper('%${filter.RefPay}%')))`;
    }
    if (filter.typeDoc) {
      queryFilter += `     and upper(fs.idDocpaye) like(upper('${filter.typeDoc}%'))`;
    }
    if (filter.DateDouc) {
      queryFilter += ` and  FORMAT( DateOperation, 'yyyy-MMMM') like(upper('%${filter.DateDouc}%'))`;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      //.input("dateExercices", getSql().VarChar, filter.dateExercices)
      .query(`${logfacture.LogTvaCount} ${queryFilter} `);

    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.GetLogTvaFilter = async (req, res) => {
  try {
    let filter = req.query.filter || "{}";
    filter = JSON.parse(filter);

    const pool = await getConnection();
    const result = await pool
      .request()
      //.input("dateExercices", getSql().VarChar, filter.dateExercices)
      .query(`${logfacture.LogTvaFilter}`);

    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.GetOneAvanceDetails = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    const pool = await getConnection();
    // console.log(logfacture.GetOneAvanceDetails);
    if (req.params.id != null) {
      const result = await pool
        .request()
        .input("id", getSql().VarChar, req.params.id).query(`
    ${logfacture.GetOneAvanceDetails} `);
      res.set("Content-Range", `newlogfacture 0-1/1`);
      res.json(result.recordset[0]);
    }
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
