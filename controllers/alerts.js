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

const RAS_TVA_SORTABLE = {
  id: "lf.DateOperation",
  DateOperation: "lf.DateOperation",
  dateFactue: "rt.dateFactue",
  nom: "rt.nom",
  RefernceDOC: "rt.RefernceDOC",
  HT: "rt.HT",
  RaS: "rt.RaS",
};

const appendRasTvaDateFilter = (filter, request) => {
  let queryFilter = "";
  if (filter.DateOperation2) {
    const month = String(filter.DateOperation2).slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(month)) {
      queryFilter += " and format(lf.DateOperation,'yyyy-MM') = @dateOpMonth";
      request.input("dateOpMonth", getSql().VarChar, month);
    }
  }
  return queryFilter;
};

exports.getRasTva = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["DateOperation","DESC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    const sortField = RAS_TVA_SORTABLE[sort[0]] || "lf.DateOperation";
    const sortOrder = String(sort[1]).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const pool = await getConnection();
    const request = pool.request();
    const queryFilter = appendRasTvaDateFilter(filter, request);

    const offset = Number(range[0]) || 0;
    const fetchCount = Number(range[1]) + 1 - Number(range[0]);
    request.input("offset", getSql().Int, offset);
    request.input("limit", getSql().Int, fetchCount > 0 ? fetchCount : 10);

    const result = await request.query(
      `${Alerts.rasTva} ${queryFilter}
      ORDER BY ${sortField} ${sortOrder}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `rastva ${range[0]}-${range[1]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
exports.getRasTvaFilter = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Alerts.FilterRASTva);

    res.set(
      "Content-Range",
      `rastvafilter 0-${Math.max(result.recordset.length - 1, 0)}/${result.recordset.length}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
exports.getRasTvaCount = async (req, res, next) => {
  try {
    let filter = req.query.filter || "{}";
    filter = JSON.parse(filter);

    const pool = await getConnection();
    const request = pool.request();
    const queryFilter = appendRasTvaDateFilter(filter, request);

    const result = await request.query(`
      SELECT COUNT(*) AS count FROM (
        ${Alerts.rasTva}
        ${queryFilter}
      ) AS ras_tva_rows
    `);

    req.count = result.recordset[0].count;
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

exports.GetLocationSituation = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.nom) {
      queryFilter += ` and upper(nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.designation) {
      queryFilter += ` and upper(designation) like(upper('%${filter.designation}%'))`;
    }
    if (filter.codeAffaire) {
      queryFilter += ` and upper(concat(c.id,' | ',c.LIBELLE)) like(upper('%${filter.codeAffaire}%'))`;
    }
    if (filter.categorie) {
      queryFilter += ` and upper(categorie) like(upper('%${filter.categorie}%'))`;
    }
    if (filter.categorie) {
      queryFilter += ` and upper(categorie) like(upper('%${filter.categorie}%'))`;
    }
    if (filter.mois) {
      queryFilter += ` and upper(mois) like(upper('%${filter.mois}%'))`;
    }

    console.log(filter);
    const pool = await getConnection();

    const result = await pool.request().query(`
      ${Alerts.locationSituation} ${queryFilter} 
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

exports.GetLocationSituationCount = async (req, res, next) => {
  let filter = req.query.filter || "{}";
  filter = JSON.parse(filter);
  try {
    let queryFilter = "";
    if (filter.nom) {
      queryFilter += ` and upper(nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.designation) {
      queryFilter += ` and upper(designation) like(upper('%${filter.designation}%'))`;
    }
    if (filter.codeAffaire) {
      queryFilter += ` and upper(concat(c.id,' | ',c.LIBELLE)) like(upper('%${filter.codeAffaire}%'))`;
    }
    if (filter.categorie) {
      queryFilter += ` and upper(categorie) like(upper('%${filter.categorie}%'))`;
    }
    if (filter.categorie) {
      queryFilter += ` and upper(categorie) like(upper('%${filter.categorie}%'))`;
    }
    if (filter.mois) {
      queryFilter += ` and upper(mois) like(upper('%${filter.mois}%'))`;
    }
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${Alerts.locationSituationCount} ${queryFilter}`);

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

exports.getRasIR = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.DateOperation2) {
      queryFilter += ` and format(lf.DateOperation,'yyyy-MM') = '${filter.DateOperation2}' `;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${Alerts.rasIr} ${queryFilter} Order by ${sort[0]} ${sort[1]}`);

    res.set("Content-Range", `rasir ${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getRasIRFilter = async (req, res) => {
  try {
    let sort = req.query.sort || '["id" , "ASC"]';

    sort = JSON.parse(sort);

    const pool = await getConnection();
    console.log(`${Alerts.FilterRASIR} Order by ${sort[0]} ${sort[1]}`);

    const result = await pool
      .request()
      .query(`${Alerts.FilterRASIR} Order by ${sort[0]} ${sort[1]}`);

    res.set("Content-Range", `rasirfilter 1000`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getRasIRCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Alerts.countRasIR);

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

exports.GetAttestationSaisie = async (req, res) => {
  try {
    let range  = JSON.parse(req.query.range  || "[0,9]");
    let sort   = JSON.parse(req.query.sort   || '["id","ASC"]');
    let filter = JSON.parse(req.query.filter || "{}");

    let queryFilter = "";
    if (filter.nom)           queryFilter += ` AND UPPER(nom) LIKE UPPER('%${filter.nom}%')`;
    if (filter.numeroFacture) queryFilter += ` AND UPPER(numeroFacture) LIKE UPPER('%${filter.numeroFacture}%')`;
    if (filter.mois)          queryFilter += ` AND mois LIKE '%${filter.mois}%'`;

    const pool = await getConnection(); // 👈 présent ?
    const finalQuery = `
      ${Alerts.attestationSaisie} ${queryFilter}
      ORDER BY ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS
      FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY
    `;
    const result = await pool.request().query(finalQuery);

    res.set("Content-Range", `attestationsaisie ${range[0]}-${range[1]}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.GetAttestationSaisieCount = async (req, res, next) => {
  try {
    let filter = JSON.parse(req.query.filter || "{}");

    let queryFilter = "";
    if (filter.nom)           queryFilter += ` AND UPPER(nom) LIKE UPPER('%${filter.nom}%')`;
    if (filter.numeroFacture) queryFilter += ` AND UPPER(numeroFacture) LIKE UPPER('%${filter.numeroFacture}%')`;
    if (filter.mois)          queryFilter += ` AND mois LIKE '%${filter.mois}%'`;

    const pool = await getConnection(); // 👈 présent ?
    const result = await pool.request().query(
      `${Alerts.attestationSaisieCount} ${queryFilter}`
    );

    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    console.log("COUNT ERROR:", error.message);
    res.status(500).send(error.message);
  }
};