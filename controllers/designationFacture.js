const { getConnection, getSql } = require("../database/connection");
const { designation } = require("../database/querys");

exports.getdesignations = async(req, res) => {
    try {
        let range = req.query.range || "[0,9]";
        let sort = req.query.sort || '["iddesignation" , "ASC"]';
        let filter = req.query.filter || "{}";
        range = JSON.parse(range);
        sort = JSON.parse(sort);
        filter = JSON.parse(filter);
        console.log(filter);
        let queryFilter = "";
        if (filter.codeDesignation) {
            queryFilter += ` and upper(codeDesignation) like(upper('%${filter.codeDesignation}%'))`;
        }

        console.log(queryFilter);
        const pool = await getConnection();

        const result = await pool.request().query(
            `${designation.getDesignation} ${queryFilter} Order by ${sort[0]} ${
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



exports.getdesignationbycode = async(req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("id", getSql().VarChar, req.params.id)
            .query(designation.getdesignationbynom);

        res.set("Content-Range", `virement 0-1/1`);
        res.json(result.recordset);
    } catch (error) {
        res.send(error.message);
        res.status(500);
    }
};