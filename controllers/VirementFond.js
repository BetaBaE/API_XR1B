const { getConnection, getSql } = require("../database/connection");
const { virementsFond } = require("../database/querys");



async function AddToTotalOv(number, id) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(
        `update [DAF_Order_virements_Fond] set total = total+${number} ,tailleOvPrint=tailleOvPrint+1  where id ='${id}'`
      );
console.log("id",id)
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}
async function MiunsFromTotalOv(number, id) {
  try {
    // let num = MontantFixed(number);
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(
        `update [DAF_Order_virements_Fond] set total = total-${number} where id ='${id}'`
      );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}


exports.getVirementFondCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(virementsFond.getCount);
    req.count = result.recordset[0].count;
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
exports.createVirementsFond = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Redacteur", getSql().VarChar, req.body.Redacteur)
      .input("orderVirementFondId", getSql().VarChar, req.body.orderVirementFondId)
      .input("RibAtnerDestId", getSql().Int, req.body.RibAtnerDestId)
      .input("montantVirement", getSql().Float, req.body.montantVirement)
      .query(virementsFond.create);
    
    await AddToTotalOv(req.body.montantVirement, req.body.orderVirementFondId);
    res.json({ id:"", montantVirement: req.body.montantVirement });
  } catch (error) {
    res.status(500).send(error);
  console.log(error)
  }
};



exports.getVirementsFond = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";
    if (filter.orderVirementId) {
      queryFilter += ` and upper(orderVirementFondId) like(upper('%${filter.orderVirementId}%'))`;
    }
    if (filter.nom) {
      queryFilter += ` and upper(ra.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.rib) {
      queryFilter += ` and ra.rib like('%${filter.rib}%')`;
    }
    if (filter.Etat) {
      queryFilter += ` and upper(v.Etat) like(upper('%${filter.Etat}%'))`;
    }

    console.log(queryFilter);

    const pool = await getConnection();
    const result = await pool.request().query(
      `${virementsFond.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `VirementFond ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateVirmeentsFond = async (req, res) => {
  console.log(req.body);
  const { montantVirement, Etat, orderVirementId, nom, dateOperation } =
    req.body;
  if (montantVirement == null || orderVirementId == null || nom == null) {
    return res.status(400).json({ error: "all fields are required!" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("etat", getSql().VarChar, Etat)
      .input("dateOperation", getSql().Date, dateOperation)
      .input("id", getSql().Int, req.params.id)
      .query(virementsFond.update);
    if (Etat === "Annuler") {
      MiunsFromTotalOv(montantVirement, orderVirementId);
     
    }
    res.json({
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneVirementByIdFond = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(virementsFond.getOne);

    res.set("Content-Range", `virementFond 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

// exports.CheckedFournisseurDejaExiste = async (req, res) => {
//   try {
//     const pool = await getConnection(); // Assurez-vous que getConnection retourne une instance de pool de connexion

//     const result = await pool
//       .request()
//       .input("ribFournisseurId",getSql().Int, req.params.ribFournisseurId)
//       .query(virements.CheckedFournisseurDejaExiste);

//     res.set("Content-Range", `virement 0-1/1`);
//     res.json(result.recordset[0]);
//   } catch (error) {
//     console.error("Erreur lors de l'exécution de la requête :", error);
//     res.status(500).send(error.message);
//   }
// };