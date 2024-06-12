const { getConnection, getSql } = require("../database/connection");
const { Fournisseurs } = require("../database/querys");

exports.getFournisseursCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(Fournisseurs.getFournisseursCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFournissuers = async (req, res) => {
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
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.codeFournisseur) {
      queryFilter += ` and upper(fou.codeFournisseur) like('%${filter.codeFournisseur}%')`;
    }
    console.log(queryFilter);
    const pool = await getConnection();

    const result = await pool.request().query(
      `${Fournisseurs.getAllFournisseurs} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getAllFournissuers = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    res.set("Content-Range", `fournisseurs 0-${req.count - 1}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createFournisseurs = async (req, res) => {
  const { CodeFournisseur, nom ,Echeance,IF,mail,addresse,ICE
  ,Redacteur,catFournisseur
  } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("CodeFournisseur", getSql().VarChar, CodeFournisseur)
      .input("nom", getSql().VarChar, nom)
      .input("catFournisseur", getSql().VarChar, catFournisseur)
    
      .input("ICE", getSql().VarChar, ICE)
      .input("IF", getSql().VarChar, IF)
      .input("addresse", getSql().VarChar, addresse)
      .input("mail", getSql().VarChar, mail)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .query(Fournisseurs.createFournisseur);
    console.log("success");
    res.json({
      id: "",
      CodeFournisseur, nom ,Echeance,IF,mail,addresse,ICE
    });
  } catch (error) {
    
    // switch (error.originalError.info.number) {
    //   case 547:
    //       error.message = "date invalid";
    //       break;
    //     case 2627:
    //       error.message = "déja existe";
    //       break;
    //   }
      
      res.status(500);
      res.send(error.message);
  console.log(error.message)
  
  
    }
};

exports.getRibsFournisseurValid = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(Fournisseurs.RibsFournisseurValid);

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs 0-${req.count - 1}/${req.count - 1}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.FournisseursRibValid = async (req, res) => {
  let filter = req.query.ordervirment || "{}";
  filter = JSON.parse(filter);

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(Fournisseurs.RibsFournisseurValid);
    res.set("Content-Range", `fournisseurs 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};





exports.getfournisseurById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(Fournisseurs.getOne);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};


exports.updatefournisseur = async (req, res) => {
  const { CodeFournisseur,
 nom,
   ICE,
   IF,
addresse,
  mail,
  catFournisseur 
} =
    req.body;
  try {
    const pool = await getConnection();

    await pool
      .request()

      .input("id", getSql().Int, req.params.id)
     .input("CodeFournisseur", getSql().VarChar, CodeFournisseur)
      .input("nom", getSql().VarChar, nom)
      .input("ICE", getSql().VarChar, ICE)
      .input("IF", getSql().VarChar, IF)
      .input("addresse", getSql().VarChar, addresse)
      .input("mail", getSql().VarChar, mail)
      .input("catFournisseur", getSql().VarChar, catFournisseur)
      .query(Fournisseurs.update);

    res.json({
      id: req.params.id,
      CodeFournisseur,
      nom,
        ICE,
        IF,
     addresse,
       mail,
       catFournisseur
    });
  } catch (error) {
   

    res.status(500);
    res.send(error.message);
  }
};


exports.getfournisseurwithecheance = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(Fournisseurs.getallfournisseurwithecheanceLoi);

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs 0-${req.count - 1}/${req.count - 1}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

/* get fournisseur nomination */
exports.getNomfournisseur = async (req, res) => {
  const {nom} = req.body;
  console.log("req.body", req.body);
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, nom)
      .query(Fournisseurs.getNomfournisseur);
    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs 0-${req.count - 1}/${req.count - 1}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
