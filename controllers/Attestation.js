const { getConnection, getSql } = require("../database/connection");
const { AttestationFiscalite } = require("../database/querys");

exports.getAttestation = async(req, res) => {
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
        if (filter.nom) {
          queryFilter += ` and upper(fou.nom) like(upper('%${filter.nom}%'))`;
        }


        const pool = await getConnection();

        const result = await pool.request().query(
            `${AttestationFiscalite.getAllAttestation} ${queryFilter} Order by ${sort[0]} ${
          sort[1]
        }
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
        );

        console.log(req.count);
        res.set(
            "Content-Range",
            `Attestation ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
        );
        res.json(result.recordset);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};



exports.getAttestationCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(AttestationFiscalite.getAllAttestationCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};




exports.create = async (req, res) => {
  const { idfournisseur,dateDebut,redacteur,numAttestation
  } = req.body;

  try {
    const pool = await getConnection();
   
    await pool
      .request()
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("dateDebut", getSql().Date, dateDebut)
      .input("numAttestation", getSql().VarChar, numAttestation)
      .input("redacteur", getSql().VarChar, redacteur)
      .query(AttestationFiscalite.create);
    console.log("success");
    res.json({
      id: "",
      idfournisseur,dateDebut,redacteur,numAttestation
    });
  } catch (error) {  
      res.status(500);
      res.send(error.message);
  console.log(error.message)
  
  
    }
};
