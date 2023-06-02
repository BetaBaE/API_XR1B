const { getConnection, getSql } = require("../database/connection");
const {chantiers } = require("../database/querys");

exports.getChantiers= async (req, res) => {
    try {
      let range = req.query.range || "[0,9]";
      let sort = req.query.sort || '["id" , "ASC"]';
      let filter = req.query.filter || "{}";
      range = JSON.parse(range);
      sort = JSON.parse(sort);
      filter = JSON.parse(filter);
      console.log(filter);
      let queryFilter = "";
      if (filter.LIBELLE) {
        queryFilter += ` and upper(nom) like(upper('%${filter.nom}%'))`;
      }
      
      console.log(queryFilter);
      const pool = await getConnection();
  
      const result = await pool.request().query(
        `${chantiers.getChantiers} ${queryFilter} Order by ${sort[0]} ${
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
  
  exports.getChantierCount = async (req, res, next) => {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .query(chantiers.getcountChantier);
      req.count = result.recordset[0].count;
      next();
    } catch (error) {
      res.status(500);
      console.log(error.message);
      res.send(error.message);
    }
  };
  exports.getchantierbyfactureid = async (req, res) => {
    try {
      const pool = await getConnection();
  
      const result = await pool
        .request()
        .input("id", getSql().Int, req.params.id)
        .query(chantiers.getChantiersbyfactureid);
  
      res.set("Content-Range", `cahntier 0-1/1`);
  
      res.json(result.recordset);
    } catch (error) {
      res.send(error.message);
      res.status(500);
    }
  };