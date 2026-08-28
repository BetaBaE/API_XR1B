const { getConnection, getSql } = require("../database/connection");
const { Dossier } = require("../database/Dossier");

function generateId(prefix, number) {
  const year = new Date().getFullYear(); // system year
  if (!number) {
    throw new Error("Number must be between 0 and 9999");
  }
  let paddedNumber = number.toString().padStart(4, "0");
  return `${prefix}-${paddedNumber}-${year}`;
}

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
exports.getDossierCountByYear = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Dossier.getCountByYear);
    req.num = result.recordset[0].num;
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
    const pool = await getConnection();
    const request = pool.request();

    let queryFilter = "";
    // Recherche globale (react-admin AutocompleteInput / ReferenceInput)
    if (filter.q) {
      queryFilter +=
        " and (NumDossier like @q or upper(Libele) like upper(@q) or f.nom like @q)";
      request.input("q", getSql().VarChar, `%${filter.q}%`);
    }
    if (filter.NumDossier) {
      queryFilter += " and NumDossier like @NumDossier";
      request.input("NumDossier", getSql().VarChar, `%${filter.NumDossier}%`);
    }
    if (filter.Libele) {
      queryFilter += " and upper(Libele) like upper(@Libele)";
      request.input("Libele", getSql().VarChar, `%${filter.Libele}%`);
    }
    if (filter.nom) {
      queryFilter += " and f.nom like @nom";
      request.input("nom", getSql().VarChar, `%${filter.nom}%`);
    }
    if (filter.Etat) {
      queryFilter += " and d.Etat like @Etat";
      request.input("Etat", getSql().VarChar, `%${filter.Etat}%`);
    }
    // Résolution par id (react-admin getMany pour ReferenceInput)
    if (filter.id !== undefined && filter.id !== null) {
      const ids = Array.isArray(filter.id) ? filter.id : [filter.id];
      const validIds = ids.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      if (validIds.length > 0) {
        const placeholders = validIds.map((_, i) => `@id${i}`);
        validIds.forEach((idValue, i) => {
          request.input(`id${i}`, getSql().Int, idValue);
        });
        queryFilter += ` and d.id in (${placeholders.join(", ")})`;
      }
    }

    const offset = Number(range[0]) || 0;
    const fetchCount = Number(range[1]) + 1 - Number(range[0]);
    request.input("offset", getSql().Int, offset);
    request.input("limit", getSql().Int, fetchCount > 0 ? fetchCount : 10);

    const result = await request.query(
      `${Dossier.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `dossier ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createDossier = async (req, res) => {
  const { Libele, idFournisseur, Redacteur, NumDossier } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("Libele", getSql().VarChar, Libele)
      .input("idFournisseur", getSql().Int, idFournisseur)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("NumDossier", getSql().VarChar, generateId("DOS", req.num))
      .query(Dossier.create);

    res.json({
      id: "",
      Libele,
      idFournisseur,
      Redacteur,
      NumDossier,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};

exports.getDossierById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(Dossier.getOne);

    res.set("Content-Range", `dossier 0-1/1`);
    res.json(result.recordset[0] || {});
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateDossier = async (req, res) => {
  const { Etat } = req.body;
  if (Etat == null) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("etat", getSql().VarChar, Etat)
      .input("id", getSql().VarChar, req.params.id)
      .query(Dossier.update);

    res.json({
      Etat,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getFournisseurByIdDossier = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(Dossier.getFournisseurByIdDossier);

    res.set("Content-Range", `dossier 0-1/1`);
    res.json(result.recordset || {});
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
