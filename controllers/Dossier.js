const { getConnection } = require("../database/connection");
const { Dossier } = require("../database/Dossier");

exports.getDossierCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Dossier.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getDossiers = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.Libele) {
      queryFilter += ` and upper(Libele) like(upper('%${filter.Libele}%'))`;
    }
    // if (filter.idFournisseur) {
    //   queryFilter += ` and upper(nom) like(upper('%${filter.nom}%'))`;
    // }
    if (filter.nomFournisseur) {
      queryFilter += ` and nomFournisseur like('%${filter.nomFournisseur}%')`;
    }
    if (filter.NumDossier) {
      queryFilter += ` and NumDossier like('%${filter.NumDossier}%')`;
    }
    console.log(queryFilter);
    const pool = await getConnection();
    // const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    const result = await pool.request().query(
      `${Dossier.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `factures ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
