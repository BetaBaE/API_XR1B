const { getConnection, getSql } = require("../database/connection");
const { BonLivraison } = require("../database/querys");


exports.getBonLivraison = async(req, res) => {
    try {
        let range = req.query.range || "[0,9]";
        let sort = req.query.sort || '["idfacturenavette" , "ASC"]';
        let filter = req.query.filter || "{}";
        range = JSON.parse(range);
        sort = JSON.parse(sort);
        filter = JSON.parse(filter);
        console.log(filter);
        let queryFilter = "";
        if (filter.Bonlivraison) {
            queryFilter += `and upper(Bonlivraison) like(upper('%${filter.Bonlivraison}%'))`;
        }

        console.log(queryFilter);
        const pool = await getConnection();

        const result = await pool.request().query(
            `${BonLivraison.getAllBl} ${queryFilter} Order by ${sort[0]} ${
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


exports.getBlCount = async (req, res, next) => {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(BonLivraison.getAllBlCount);
      req.count = result.recordset[0].count;
      next();
    } catch (error) {
      res.status(500);
      console.log(error.message);
      res.send(error.message);
    }
  };
  