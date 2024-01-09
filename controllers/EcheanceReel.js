const { getConnection, getSql } = require("../database/connection");
const { EcheanceReel } = require("../database/querys");

exports.getEcheanceReel = async(req, res) => {
    try {
        let range = req.query.range || "[0,9]";
        let sort = req.query.sort || '["nom" , "ASC"]';
        let filter = req.query.filter || "{}";
        range = JSON.parse(range);
        sort = JSON.parse(sort);
        filter = JSON.parse(filter);
        console.log(filter);
        let queryFilter = "";


        console.log(queryFilter);
        const pool = await getConnection();

        const result = await pool.request().query(
            `${EcheanceReel.getAllecheanceReel} ${queryFilter} Order by ${sort[0]} ${
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



exports.getEcheanceReelCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(EcheanceReel.getAllecheanceReelCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};




exports.create = async (req, res) => {
  const { idfournisseur, modalitePaiement ,dateecheance
    ,Redacteur
  } = req.body;

  try {
    const pool = await getConnection();
   
    await pool
      .request()
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("modalitePaiement", getSql().VarChar, modalitePaiement)
      .input("dateecheance", getSql().Date, dateecheance)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .query(EcheanceReel.create);
    console.log("success");
    res.json({
      id: "",
      idfournisseur, modalitePaiement ,dateecheance,Redacteur
      
    });
  } catch (error) {  
      res.status(500);
      res.send(error);
  console.log(error)
  
  
    }
};

exports.getEcheanceReelbyfournisseur = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idfournisseur", getSql().Int, req.params.idfournisseur)
      .query(EcheanceReel.getEcheanceReelbyfournisseur); // Correction de la faute de frappe ici
    console.log("testes",`${EcheanceReel.getEcheanceReelbyfournisseur}`)
      console.log("id",req.params.idfournisseur )
    res.set("Content-Range", `cahntier 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message); // Correction de l'ordre des méthodes ici
  }
}
