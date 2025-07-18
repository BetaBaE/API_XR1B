const { getConnection, getSql } = require("../database/connection");
const { Alerts } = require("../database/Alerts");

exports.getAlertAttestationRegFisc = async (req, res) => {
  try {
    let range = req.query.range || "[0,10]";
    let sort = req.query.sort || '["Restant" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";
    if (filter.nom) {
      queryFilter += ` and nom like('%${filter.nom}%')`;
    }
    if (filter.rib) {
      queryFilter += ` and rib like('%${filter.rib}%')`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(
      `${Alerts.expirationAttestationFisc} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY     
      `
    );
    /*
      To FIX : 
     
           OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY
    */
    res.set(
      "Content-Range",
      `alert1 ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getAlertAttestationRegFiscCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(Alerts.expirationAttestationFiscCount);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getRasTva = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.DateOperation2) {
      queryFilter += ` and format(lf.DateOperation,'yyyy-MMMM') = '${filter.DateOperation2}' `;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${Alerts.rasTva} ${queryFilter} Order by ${sort[0]} ${sort[1]}`);

    res.set("Content-Range", `rastva ${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getRasTvaFilter = async (req, res) => {
  try {
    let sort = req.query.sort || '["id" , "ASC"]';

    sort = JSON.parse(sort);

    const pool = await getConnection();
    console.log(`${Alerts.FilterRASTva} Order by ${sort[0]} ${sort[1]}`);

    const result = await pool
      .request()
      .query(`${Alerts.FilterRASTva} Order by ${sort[0]} ${sort[1]}`);

    res.set("Content-Range", `rastvafilter 1000`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getRasTvaCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Alerts.countRasTVA);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFactureAyantFNSage = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    //{"nom":" ffff","numeroFacture":"ddd","FN":"sss","CODEAFFAIRE":"dd"}
    if (filter.nom) {
      queryFilter += ` and upper(ef.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` and upper(fa.numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.FN) {
      queryFilter += ` and upper(ef.RTCFIELD2) like(upper('%${filter.FN}%'))`;
    }
    if (filter.CODEAFFAIRE) {
      queryFilter += ` and upper(ef.CODEAFFAIRE) like(upper('%${filter.CODEAFFAIRE}%'))`;
    }

    const pool = await getConnection();
    console.log(`${Alerts.FactureAyantFN} Order by ${sort[0]} ${sort[1]}`);

    const result = await pool.request().query(`${
      Alerts.FactureAyantFN
    } ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);

    res.set(
      "Content-Range",
      `faayantfn ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getFactureAyantFNSageCount = async (req, res, next) => {
  let filter = req.query.filter || "{}";
  filter = JSON.parse(filter);
  try {
    let queryFilter = "";
    //{"nom":" ffff","numeroFacture":"ddd","FN":"sss","CODEAFFAIRE":"dd"}
    if (filter.nom) {
      queryFilter += ` and upper(ef.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` and upper(fa.numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.FN) {
      queryFilter += ` and upper(ef.RTCFIELD2) like(upper('%${filter.FN}%'))`;
    }
    if (filter.CODEAFFAIRE) {
      queryFilter += ` and upper(ef.CODEAFFAIRE) like(upper('%${filter.CODEAFFAIRE}%'))`;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${Alerts.FactureAyantFNCount} ${queryFilter}`);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFournisseurFA_AV = async (req, res) => {
  try {
    let sort = req.query.sort || '["id" , "ASC"]';

    sort = JSON.parse(sort);

    const pool = await getConnection();
    // console.log(`${Alerts.getFourisseurFA_AV}`);

    const result = await pool.request().query(`${Alerts.getFourisseurFA_AV}`);

    res.set("Content-Range", `FAAV 1000`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.GetPreparationPaiement = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["fs.id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    //{"nom":" ffff","numeroFacture":"ddd","FN":"sss","CODEAFFAIRE":"dd"}
    if (filter.nom) {
      queryFilter += ` and upper(fr.nom) like(upper('%${filter.nom}%'))`;
    }

    if (filter.numeroFacture) {
      queryFilter += ` and upper(fs.numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.FN) {
      queryFilter += ` and upper(ef.RTCFIELD2) like(upper('%${filter.FN}%'))`;
    }
    if (filter.codechantier) {
      queryFilter += ` and upper(fs.codechantier) like(upper('%${filter.codechantier}%'))`;
    }
    if (filter.fn) {
      if (filter.fn === "non") {
        queryFilter += ` and fn.ficheNavette is null`;
      } else if (filter.fn === "oui") {
        queryFilter += ` and fn.ficheNavette is not null`;
      }
    }
    if (filter.ans_sup) {
      queryFilter += ` and (datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))/30)*-1 > ${filter.ans_sup}`;
    }
    if (filter.ans_inf) {
      queryFilter += ` and (datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))/30)*-1 < ${filter.ans_inf}`;
    }
    console.log(filter);
    const pool = await getConnection();

    const result = await pool.request().query(`
      ${Alerts.GetPreparationPaiement} ${queryFilter} 
      ORDER BY ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS 
      FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY
    `);

    res.set("Content-Range", `faayantfn ${range[0]}-${range[1]}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.GetPreparationPaiementCount = async (req, res, next) => {
  let filter = req.query.filter || "{}";
  filter = JSON.parse(filter);
  try {
    let queryFilter = "";
    //{"nom":" ffff","numeroFacture":"ddd","FN":"sss","CODEAFFAIRE":"dd"}
    if (filter.nom) {
      queryFilter += ` and upper(fr.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` and upper(fs.numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.FN) {
      queryFilter += ` and upper(ef.RTCFIELD2) like(upper('%${filter.FN}%'))`;
    }
    if (filter.CODEAFFAIRE) {
      queryFilter += ` and upper(ef.CODEAFFAIRE) like(upper('%${filter.CODEAFFAIRE}%'))`;
    }
    if (filter.codechantier) {
      queryFilter += ` and upper(fs.codechantier) like(upper('%${filter.codechantier}%'))`;
    }
    if (filter.ans_sup) {
      queryFilter += ` and (datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))/30)*-1 > ${filter.ans_sup}`;
    }
    if (filter.ans_inf) {
      queryFilter += ` and (datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))/30)*-1 < ${filter.ans_inf}`;
    }
    if (filter.fn) {
      if (filter.fn === "non") {
        queryFilter += ` and fn.ficheNavette is null`;
      } else if (filter.fn === "oui") {
        queryFilter += ` and fn.ficheNavette is not null`;
      }
    }
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${Alerts.GetPreparationPaiementCount} ${queryFilter}`);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.GetFA_BCsameBC = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.BC) {
      queryFilter += ` and upper(BC) like(upper('%${filter.BC}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` and upper(numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.Fournisseur) {
      queryFilter += ` and (
        upper(FournisseurApp) like(upper('%${filter.Fournisseur}%')) 
        or
        upper(FournisseurSage) like(upper('%${filter.Fournisseur}%')) 
      )`;
    }
    if (filter.chantier) {
      queryFilter += ` and (
        upper(chtApp) like(upper('%${filter.chantier}%')) 
        or
        upper(chtSage) like(upper('%${filter.chantier}%')) 
      )`;
    }

    if (filter.EcartChantier) {
      queryFilter += ` and upper(EcartChantier) like(upper('%${filter.EcartChantier}%'))`;
    }
    if (filter.EcartNom) {
      queryFilter += ` and upper(EcartNom) like(upper('%${filter.EcartNom}%'))`;
    }
    if (filter.EcartTTC) {
      queryFilter += ` and upper(RiskEcartTTC) like(upper('%${filter.EcartTTC}%'))`;
    }
    console.log(filter);
    const pool = await getConnection();

    const result = await pool.request().query(`
      ${Alerts.FA_BCsameBC} ${queryFilter} 
      ORDER BY ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS 
      FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY
    `);

    res.set("Content-Range", `faayantfn ${range[0]}-${range[1]}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.GetFA_BCsameBCCount = async (req, res, next) => {
  let filter = req.query.filter || "{}";
  filter = JSON.parse(filter);
  try {
    let queryFilter = "";
    if (filter.BC) {
      queryFilter += ` and upper(BC) like(upper('%${filter.BC}%'))`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` and upper(numeroFacture) like(upper('%${filter.numeroFacture}%'))`;
    }
    if (filter.Fournisseur) {
      queryFilter += ` and (
        upper(FournisseurApp) like(upper('%${filter.Fournisseur}%')) 
        or
        upper(FournisseurSage) like(upper('%${filter.Fournisseur}%')) 
      )`;
    }
    if (filter.chantier) {
      queryFilter += ` and (
        upper(chtApp) like(upper('%${filter.chantier}%')) 
        or
        upper(chtSage) like(upper('%${filter.chantier}%')) 
      )`;
    }

    if (filter.EcartChantier) {
      queryFilter += ` and upper(EcartChantier) like(upper('%${filter.EcartChantier}%'))`;
    }
    if (filter.EcartNom) {
      queryFilter += ` and upper(EcartNom) like(upper('%${filter.EcartNom}%'))`;
    }
    if (filter.EcartTTC) {
      queryFilter += ` and upper(RiskEcartTTC) like(upper('%${filter.EcartTTC}%'))`;
    }
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${Alerts.FA_BCsameBCCount} ${queryFilter}`);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
