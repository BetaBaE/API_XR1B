const { getConnection, getSql } = require("../database/connection");
const { avancevirement } = require("../database/querys");

const MontantFixed = (num) => {
    return parseFloat(num.toFixed(2));
};

async function calculSumFactures(facturelist) {
    let facturelistString = facturelist.join("','");

    console.log(facturelist.join("','"));
    try {
        console.log(`SELECT  SUM(netapayer) as Totale
  FROM(
    select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
	  where montantAvance is not null
    and id in ('${facturelistString}')
        UNION ALL
	  select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
    where montantAvance is not null
    and id in ('${facturelistString}')
    ) sum `);
        const pool = await getConnection();
        const result = await pool.request()
            .query(` SELECT   SUM(netapayer)  as Totale
  FROM(
    select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
	  where montantAvance is not null
    and id in ('${facturelistString}')
        UNION ALL
	  select sum(montantAvance) as netapayer from [dbo].[ficheNavette]
    where montantAvance is not null
    and id in ('${facturelistString}')
    ) sum `);

        return result.recordset[0];
    } catch (error) {
        console.error(error.message);
        // res.status(500);
    }
}
async function getFactureFromView(facturelist) {
    let facturelistString = facturelist.join("','");

    try {
        const pool = await getConnection();
        const result = await pool
            .request()

        .query(
            `${avancevirement.getDataFromLogFacture} and id in('${facturelistString}')`
        );
        console.log(
            "test",
            `${avancevirement.getDataFromLogFacture} and id in('${facturelistString}')`
        );
        return result.recordset;
    } catch (error) {
        console.error(error.message);
    }
}

async function insertFactureInLog(ArrayOfFacture, orderVirementId) {
    let query = ` `;
    ArrayOfFacture.forEach(
        ({
                CODEDOCUTIL,
                chantier,
                nom,
                LIBREGLEMENT,
                DateFacture,
                TTC,
                HT,
                MontantTVA,
                montantAvance,
                id
            },
            i
        ) => {
            i != ArrayOfFacture.length - 1 ?
                (query += `('${CODEDOCUTIL}','${chantier}','${nom}','${LIBREGLEMENT}','${DateFacture}','${0}','${0}','${0}','${montantAvance}','${orderVirementId}','${id}','avance virement'),`) :
                (query += `('${CODEDOCUTIL}','${chantier}','${nom}','${LIBREGLEMENT}','${DateFacture}','${0}','${0}','${0}','${montantAvance}','${orderVirementId}','${id}','avance virement')`);
        }
    );
    console.log(`${avancevirement.createLogFacture} '${query}'`);
    console.log(`${query}`);
    try {
        const pool = await getConnection();
        const result = await pool
            .request()
            .query(`${avancevirement.createLogFacture}${query}`);
    } catch (error) {
        console.error(error.message);
    }
}

async function AddToTotalOv(number, id) {
    try {
        // let num = MontantFixed(number);

        const pool = await getConnection();
        const result = await pool
            .request()
            // .input("montantVirement", getSql().Numeric, number)
            // .input("id", getSql().VarChar, id)
            .query(
                `update [DAF_Order_virements] set total = total+${number} where id ='${id}'`
            );

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
                `update [DAF_Order_virements] set total = total-${number} where id ='${id}'`
            );
        return result.recordset;
    } catch (error) {
        console.error(error.message);
    }
}

async function updateLogFactureWhenAnnuleVirement(idov, nom) {
    try {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("orderVirementId", getSql().VarChar, idov)
            .input("nom", getSql().VarChar, nom)
            .query(avancevirement.updateLogFactureWhenAnnuleV);
        return result.recordset;
    } catch (error) {
        console.error(error.message);
    }
}

exports.getVirementCount = async(req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(avancevirement.getCount);
        req.count = result.recordset[0].count;
        // res.json({ count: res.conut });
        next();
    } catch (error) {
        res.status(500);
        console.log(error.message);
        res.send(error.message);
    }
};

exports.createVirements = async(req, res) => {
    // console.log(req.body);
    let { facturelist } = req.body;
    let { Totale } = await calculSumFactures(facturelist);
    //let num = MontantFixed(Totale);
    let ArrayOfFacture = await getFactureFromView(facturelist);
    insertFactureInLog(ArrayOfFacture, req.body.orderVirementId);
    console.log(req.body, Totale);
    console.log("virement", avancevirement.create);
    try {
        const pool = await getConnection();
        const result = await pool
            .request()

        .input("orderVirementId", getSql().VarChar, req.body.orderVirementId)
            .input("fournisseurId", getSql().Int, req.body.fournisseurId)
            .input("ribFournisseurId", getSql().Int, req.body.ribFournisseurId)
            .input("montantVirement", getSql().Float, Totale)
            .query(avancevirement.create);
        await AddToTotalOv(Totale, req.body.orderVirementId);
        res.json({ id: "" });
    } catch (error) {
        res.send(error.message);
        res.status(500);
    }
    // return res.json([{ id: "id" }]);
};

exports.getVirements = async(req, res) => {
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
            queryFilter += ` and upper(orderVirementId) like(upper('%${filter.orderVirementId}%'))`;
        }
        if (filter.nom) {
            queryFilter += ` and upper(f.nom) like(upper('%${filter.nom}%'))`;
        }
        if (filter.rib) {
            queryFilter += ` and rf.rib like('%${filter.rib}%')`;
        }
        if (filter.Etat) {
            queryFilter += ` and upper(v.Etat) like(upper('%${filter.Etat}%'))`;
        }

        console.log(queryFilter);

        const pool = await getConnection();
        const result = await pool.request().query(
            `${avancevirement.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
        );
        res.set(
            "Content-Range",
            `ribFournisseur ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
        );

        res.json(result.recordset);
    } catch (error) {
        res.send(error.message);
        res.status(500);
    }
};

exports.updateVirmeents = async(req, res) => {
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
            .query(avancevirement.update);
        if (Etat === "Annuler") {
            MiunsFromTotalOv(montantVirement, orderVirementId);
            updateLogFactureWhenAnnuleVirement(orderVirementId, nom);
        }
        res.json({
            id: req.params.id,
        });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

exports.getOneVirementById = async(req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("id", getSql().Int, req.params.id)
            .query(avancevirement.getOne);

        res.set("Content-Range", `virement 0-1/1`);

        res.json(result.recordset[0]);
    } catch (error) {
        res.send(error.message);
        res.status(500);
    }
};