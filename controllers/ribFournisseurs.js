const { getConnection, getSql } = require("../database/connection");
const { ribFournisseur } = require("../database/querys");

exports.createRibFournisseurs = async (FournisseurId, rib,swift,banque,Redacteur) => {
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("FournisseurId", getSql().Int, FournisseurId)
      .input("rib", getSql().VarChar, rib)
      .input("swift", getSql().VarChar, swift)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("banque", getSql().VarChar, banque)
      .query(ribFournisseur.create);
  } catch (error) {
    console.log(error);
  }
};

exports.getRibsFournisseurs = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";
    if (filter.swift) {
      queryFilter += ` and f.swift like('%${filter.swift}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and f.nom like('%${filter.fournisseur}%')`;
    }
    if (filter.rib) {
      queryFilter += ` and rib like('%${filter.rib}%')`;
    }
    if (filter.validation) {
      queryFilter += ` and validation like('%${filter.validation}%')`;
    }

    console.log(queryFilter);

    const pool = await getConnection();
    const result = await pool.request().query(
      `${ribFournisseur.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
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

exports.getRibFCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ribFournisseur.getCount);
    req.count = result.recordset[0].count;
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.updateRibsFournisseurs = async (req, res) => {
  const { FournisseurId, rib, validateur,swift, banque, validation } = req.body;
  if (FournisseurId == null || rib == null) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      
      .input("FournisseurId", getSql().Int, FournisseurId)
      .input("validation", getSql().VarChar, validation)
      .input("rib", getSql().VarChar, rib)
      .input("swift", getSql().VarChar, swift)
      .input("banque", getSql().VarChar, banque)
      .input("validateur", getSql().VarChar, validateur)
      .input("id", getSql().Int, req.params.id)
      .query(ribFournisseur.edit);

    console.log(`UPDATE [dbo].[DAF_RIB_Fournisseurs]
      SET FournisseurId = ${FournisseurId}
      ,rib = ${rib}
      ,swift=${swift}
      ,validation = ${validation}
      ,banque=${banque}
      ,Validateur=${validateur}
    WHERE id = ${req.params.id} `);

    res.json({
      id: req.params.id,
      FournisseurId,
      rib,
      validation,
      swift,
      banque,
      validateur
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneRibfournisseurById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(ribFournisseur.getOne);

    res.set("Content-Range", `ribFournisseur 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

// exports.getRibsValid = async (req, res) => {
//   try {
//     const pool = await getConnection();

//     const result = await pool.request().query(ribFournisseur.RibsValid);

//     console.log(req.count);
//     res.set("Content-Range", `fournisseurs 0-${req.count - 1}/${req.count}`);
//     res.json(result.recordset);
//   } catch (error) {
//     res.status(500);
//     res.send(error.message);
//   }
// };

exports.RibFournisseursValid = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(ribFournisseur.ribfournisseursvalid);

    res.set("Content-Range", `ribFournisseur 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
