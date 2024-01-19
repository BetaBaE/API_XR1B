const { getConnection, getSql } = require("../database/connection");
const { ribTemporaire } = require("../database/querys");
const { createRibFournisseurs } = require("./ribFournisseurs");

exports.getRibCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ribTemporaire.getRibCount);
    req.count = result.recordset[0].count;
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getRibs = async (req, res) => {
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
      queryFilter += ` and f.nom like('%${filter.fournisseur}%')`;
    }
    if (filter.swift) {
      queryFilter += ` and f.swift like('%${filter.swift}%')`;
    }
    if (filter.rib) {
      queryFilter += ` and rib like('%${filter.rib}%')`;
    }
    if (filter.validation) {
      queryFilter += ` and validation like('%${filter.validation}%')`;
    }

    console.log(queryFilter);

    const pool = await getConnection();

    // console.log(`${ribTemporaire.getRibs} ${queryFilter} Order by ${sort[0]} ${
    //   sort[1]
    // }
    //   OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`);

    const result = await pool.request().query(
      `${ribTemporaire.getRibs} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `ribtemporaire ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.createRibs = async (req, res) => {
  const { FournisseurId, rib,swift,banque,Redacteur,path_rib } = req.body;
 console.log("path_rib",path_rib.rawFile.path)
// const RIB_fournisseur="\\10.200.1.20/03_Compta/02-Dossier Comptabilité/01-fichiers comptabilité/04-RIB DES FRS/"+path_rib.rawFile.path
const RIB_fournisseur="C:/Users/y.ihrai/Downloads/"+path_rib.rawFile.path

try {
    const pool = await getConnection();
    await pool
      .request()
      .input("FournisseurId", getSql().Int, FournisseurId)
      .input("rib", getSql().VarChar, rib)
      .input("swift", getSql().VarChar, swift)
      .input("banque", getSql().VarChar, banque)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .query(ribTemporaire.createRibs);
    console.log("errour");
    createRibFournisseurs(FournisseurId, rib, swift,banque,Redacteur,RIB_fournisseur);
    res.json({
      id: "",
      FournisseurId,
      rib,
      swift,
      banque,
      Redacteur
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
