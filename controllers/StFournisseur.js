const { getConnection, getSql } = require("../database/connection");
const { StFournisseur } = require("../database/StFournisseur");

exports.getchefferDAffaireByFou = async (req, res) => {
  try {
    let filter = req.query.fournisseur || "{}";
    filter = JSON.parse(req.query.fournisseur);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
      SELECT FORMAT(DateFacture, 'yyyy-MM') AS id,
             FORMAT(DateFacture, 'yyyy-MM') AS name,
             SUM(TTC) AS TTC
      FROM DAF_FactureSaisie fa
      INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
      WHERE nom = @nom
        AND fa.Etat <> 'Annuler'
        AND fa.deletedAt IS NULL
      GROUP BY FORMAT(DateFacture, 'yyyy-MM')
      ORDER BY name
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `;

    // Query for the total number of records
    const totalCountQuery = `
      SELECT count(*) AS totalCount
      FROM DAF_FactureSaisie fa
      INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
      WHERE nom = @nom
        AND fa.Etat <> 'Annuler'
        AND fa.deletedAt IS NULL;
    `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .input("offset", getSql().Int, offset)
      .input("limit", getSql().Int, limit)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(totalCountQuery);

    const totalItems = totalResult.recordset[0].totalCount; // Get total count

    // Calculate Content-Range
    const end = Math.min(offset + limit - 1, totalItems - 1);
    res.set("Content-Range", `items ${offset}-${end}/${totalItems}`);

    // Send the paginated data
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getRestitiByFou = async (req, res) => {
  try {
    let filter = req.query.fournisseur || "{}";
    filter = JSON.parse(req.query.fournisseur);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
      select r.id,r.Montant,r.Redacteur,a.ModePaiement,a.ModePaiementID,r.Etat, nom 
      from DAF_RestitAvance r 
      inner join DAF_Avance a on a.id = r.idAvance
      where idFacture is null
      and Montant > 5
      and r.etat <> 'Annuler'
      and nom = @nom
      ORDER BY id
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `;

    // Query for the total number of records
    const totalCountQuery = `
      SELECT count(*) AS totalCount
      from DAF_RestitAvance r 
      inner join DAF_Avance a on a.id = r.idAvance
      where idFacture is null
      and r.etat <> 'Annuler'
      and Montant > 5
      and nom = @nom;
    `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .input("offset", getSql().Int, offset)
      .input("limit", getSql().Int, limit)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(totalCountQuery);

    const totalItems = totalResult.recordset[0].totalCount; // Get total count

    // Calculate Content-Range
    const end = Math.min(offset + limit - 1, totalItems - 1);
    res.set("Content-Range", `items ${offset}-${end}/${totalItems}`);

    // Send the paginated data
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getFAStateForByFournisseur = async (req, res) => {
  try {
    let filter = req.query.fournisseur || "{}";
    filter = JSON.parse(req.query.fournisseur);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
      with sumFASaisie as(
select 1 as id ,'FA Saisie' as name, COALESCE((sum(TTC - AcompteVal)),0)  as  NetApaye 
from DAF_FactureSaisie fa 
inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where  f.nom = @nom 
and etat = 'Saisie'
),
--1 143 250.03
FADispoAvecFN as(
select 
2 as id ,
'FADispoAvecFN' as name,
COALESCE((sum(TTC - AcompteVal)),0)  NetApaye 
from DAF_FactureSaisie fa 
inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where  f.nom = @nom 
and fa.id in (select idFacture from DAF_factureNavette) 
and etat in ('Saisie') and ([dateoperation] > FORMAT(GETDATE(), 'yyyy-01-01') or [dateoperation] is null )
and YEAR(fa.DateFacture) <= YEAR(GETDATE())
),

FAProgPourPaie as (
select 
3 as id ,
'FAProgPourPaie' as name,
COALESCE((sum(TTC - AcompteVal)),0) as  NetApaye 
from DAF_FactureSaisie fa 
inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where  f.nom = @nom 
and fa.id in (select idFacture from DAF_factureNavette) 
and etat in ('En cours') and ([dateoperation] > FORMAT(GETDATE(), 'yyyy-01-01') or [dateoperation] is null )
and YEAR(fa.DateFacture) <= YEAR(GETDATE())
),

 resume as(
select * from sumFASaisie
union all 
select * from FADispoAvecFN
union all 
select * from FAProgPourPaie)


select * from resume
order by id
OFFSET 0 ROWS
FETCH NEXT 3 ROWS ONLY;
    `;

    // Query for the total number of records
    const totalCountQuery = `
      Select 3 AS totalCount
      FROM DAF_FactureSaisie fa
    `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(totalCountQuery);

    const totalItems = totalResult.recordset[0].totalCount; // Get total count

    // Calculate Content-Range
    const end = Math.min(offset + limit - 1, totalItems - 1);
    res.set("Content-Range", `items 0-2/${totalItems}`);

    // Send the paginated data
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getstatueRIBByFou = async (req, res) => {
  try {
    let filter = req.query.fournisseur || "{}";
    filter = JSON.parse(req.query.fournisseur);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
      select r.rib,r.validation  as etat,t.Redacteur, Validateur, datecreation, r.DateModification 
from DAF_RIB_Fournisseurs r 
inner join DAF_FOURNISSEURS f on r.FournisseurId = f.id
inner join DAF_RIB_TEMPORAIRE t on t.rib = r.rib
where f.nom = @nom
    `;

    // Query for the total number of records
    const totalCountQuery = `
      Select 3 AS totalCount
      FROM DAF_FactureSaisie fa
    `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(totalCountQuery);

    const totalItems = totalResult.recordset[0].totalCount; // Get total count

    // Calculate Content-Range
    const end = Math.min(offset + limit - 1, totalItems - 1);
    res.set("Content-Range", `items 0-2/${totalItems}`);

    // Send the paginated data
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getDonneeFournissuerByNom = async (req, res) => {
  try {
    let filter = req.query.fournisseur || "{}";
    filter = JSON.parse(req.query.fournisseur);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
      select  f.catFournisseur, f.exonorer,f.ICE,f.Identifiantfiscal,f.mail from DAF_FOURNISSEURS f
where f.nom = @nom
    `;

    // Query for the total number of records
    const totalCountQuery = `
      Select 1 AS totalCount
    `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(totalCountQuery);

    const totalItems = totalResult.recordset[0].totalCount; // Get total count

    // Calculate Content-Range
    const end = Math.min(offset + limit - 1, totalItems - 1);
    res.set("Content-Range", `items 0-2/${totalItems}`);

    // Send the paginated data
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAttsFourByNom = async (req, res) => {
  try {
    let filter = req.query.fournisseur || "{}";
    filter = JSON.parse(req.query.fournisseur);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
      SELECT 
    numAttestation, 
    dateDebut, 
    MAX(dateExpiration) AS dateExpiration, 
    r.redacteur, 
    CONCAT(DATEDIFF(DAY, CAST(GETDATE() AS DATE), MAX(dateExpiration)), ' jour(s)') AS ValideJusqua
FROM 
    DAF_AttestationFiscal r 
INNER JOIN 
    DAF_FOURNISSEURS f ON r.idFournisseur = f.id
WHERE 
    f.nom = @nom
GROUP BY 
    numAttestation, 
    dateDebut, 
    r.redacteur;
    `;

    // Query for the total number of records
    const totalCountQuery = `
      Select 1 AS totalCount
    `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(totalCountQuery);

    const totalItems = totalResult.recordset[0].totalCount; // Get total count

    // Calculate Content-Range
    const end = Math.min(offset + limit - 1, totalItems - 1);
    res.set("Content-Range", `items 0-2/${totalItems}`);

    // Send the paginated data
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
