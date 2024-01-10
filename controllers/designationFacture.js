const { getConnection, getSql } = require("../database/connection");
const { designation } = require("../database/querys");
exports.getdesignations = async (req, res) => {
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


        const recordsWithSeparator = result.recordset.map(record => {
            if (record.id > 30) {
                // Ajouter le séparateur avant d'afficher l'ID 32
               
                record.designation = `Designation des factures 2024-${record.designation}`;
            }else {
                record.designation = `Ancien designation-${record.designation}`;
            }
            return record;
        });

        // const recordsWithSeparator = result.recordset.map(record => {
        //     if (record.id > 30 && record.id < 31) {
        //         // Ajouter deux lignes vides avec des valeurs spécifiques avant d'afficher l'ID 32
        //         const emptycodeDesignation = { codeDesignation: '2024' }; 
        //         const emptyDesignation = { designation: 'fin des designations 2023' }; 
        //         return [emptycodeDesignation, emptyDesignation, record];
        //     }
        //     return record;
        // }).flat(); 
        
      
        console.log(req.count);
        res.set(
            "Content-Range",
            `desiganation ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
        );
        res.json(recordsWithSeparator);
        console.log(recordsWithSeparator)
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