const { getConnection, getSql } = require("../database/connection");
const {
  AttestationFiscalite,
} = require("../database/AttestationFiscaliteQuery");
/*
  la liste des fournisseur avec leurs attestation
*/
exports.GetAttestation = async (req, res) => {
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
      queryFilter += `and upper(fou.nom) like(upper('%${filter.nom}%'))`;
    }

    if (filter.statut) {
      switch (filter.statut) {
        case "pas_attestation":
          queryFilter += ` and att.[dateExpiration] IS NULL`;
          break;
        case "expire":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) < 0`;
          break;
        case "expire_aujourdhui":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) = 0`;
          break;
        case "alerte":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) BETWEEN 1 AND 20`;
          break;
        case "ok":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) > 20`;
          break;
      }
    }

    const pool = await getConnection();

    const result = await pool.request().query(
      `${AttestationFiscalite.getAllAttestation} ${queryFilter} Order by ${
        sort[0]
      } ${sort[1]}
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

/* 
 lister le nombre des attestations 
 cette fonction  nous aide dans la pagination
 */

exports.GetAttestationCount = async (req, res, next) => {
  try {

    let filter = req.query.filter || "{}";

    filter = JSON.parse(filter);
    console.log("cont",filter);
    let queryFilter = "";


    if (filter.nom) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.nom}%'))`;
    }

    if (filter.statut) {
      switch (filter.statut) {
        case "pas_attestation":
          queryFilter += ` and att.[dateExpiration] IS NULL`;
          break;
        case "expire":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) < 0`;
          break;
        case "expire_aujourdhui":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) = 0`;
          break;
        case "alerte":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) BETWEEN 1 AND 20`;
          break;
        case "ok":
          queryFilter += ` and att.[dateExpiration] IS NOT NULL and DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) > 20`;
          break;
      }
    }
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${AttestationFiscalite.getAllAttestationCount} ${queryFilter}`);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
/* 
Fonction pour créer une attestation fiscale en fonction de l'id du fournisseur.
La date d'expédition est calculée en ajoutant 6 mois à la date de début.
*/

exports.CreateAttestation = async (req, res) => {
  const { idfournisseur, dateDebut, redacteur, numAttestation } = req.body;
  try {
    const pool = await getConnection(); // Assurez-vous que getConnection() est une fonction valide et correctement implémentée

    // Exécution de la requête SQL pour créer l'attestation fiscale
    await pool
      .request()
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("dateDebut", getSql().Date, dateDebut)
      .input("numAttestation", getSql().VarChar, numAttestation)
      .input("redacteur", getSql().VarChar, redacteur)
      .query(AttestationFiscalite.create);
    /*
      Appeler   à la requete qui permet d'inserer dans la table DAF_Attestation
                              INSERT INTO [dbo].[DAF_AttestationFiscal]  (
                              [idfournisseur]
                            ,[numAttestation]
                            ,[dateDebut]
                            ,[dateExpiration]
                            ,[redacteur]
                                      )
                                            VALUES
                                  (@idfournisseur
                                  ,@numAttestation
                                  ,@dateDebut
                                  ,DATEADD(MONTH, 6, @dateDebut)
                                  ,@redacteur
                          );
    
      */

    console.log("success");
    res.json({
      id: "", //
      idfournisseur,
      dateDebut,
      redacteur,
      numAttestation,
    });
  } catch (error) {
    res.status(500).send(error.message); // Envoie du message d'erreur en cas d'échec de la requête
    console.log(error.message);
  }
};
