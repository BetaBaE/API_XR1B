const { getConnection, getSql } = require("../database/connection");
const { designations } = require("../database/Designations");

exports.createRibsAtner = async (req, res) => {
  const { designation, codeDesignation, PourcentageTVA, PosteTVA } = req.body;

  try {
    const pool = await getConnection();
    /*
      [designation] = <@codeDesignation, varchar(50),>
      ,[PourcentageTVA] = <@PourcentageTVA, numeric(5,2),>
      ,[PosteTVA] = <@PosteTVA, int,>
      ,[Etat] = @Etat, varchar(10),>
    */
    await pool
      .request()
      .input("designation", getSql().VarChar, designation)
      .input("codeDesignation", getSql().VarChar, codeDesignation)
      .input("PourcentageTVA", getSql().VarChar, PourcentageTVA)
      .input("PosteTVA", getSql().VarChar, PosteTVA)

      .query(designations.create);
    console.log("errour");
    res.json({
      id: "",
      nom,
      rib,
      Redacteur,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getDesignationCount = async (req, res, next) => {
  let filter = req.query.filter || "{}";
  try {
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.designation) {
      queryFilter += ` and upper(designation) like(upper('%${filter.designation}%'))`;
    }
    if (filter.PosteTVA) {
      queryFilter += ` and upper(PosteTVA) like(upper('%${filter.PosteTVA}%'))`;
    }
    if (filter.PourcentageTVA) {
      queryFilter += ` and upper(PourcentageTVA) like(upper('%${filter.PourcentageTVA}%'))`;
    }
    if (filter.codeDesignation) {
      queryFilter += ` and upper(codeDesignation) like(upper('%${filter.codeDesignation}%'))`;
    }
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${designations.getCount} ${queryFilter}`);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getDesignation = async (req, res) => {
  try {
    let range = req.query.range || "[0,999]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.designation) {
      queryFilter += ` and upper(designation) like(upper('%${filter.designation}%'))`;
    }
    if (filter.PosteTVA) {
      queryFilter += ` and upper(PosteTVA) like(upper('%${filter.PosteTVA}%'))`;
    }
    if (filter.PourcentageTVA) {
      queryFilter += ` and upper(PourcentageTVA) like(upper('%${filter.PourcentageTVA}%'))`;
    }
    if (filter.codeDesignation) {
      queryFilter += ` and upper(codeDesignation) like(upper('%${filter.codeDesignation}%'))`;
    }

    console.log(queryFilter);

    const pool = await getConnection();

    const result = await pool.request().query(
      `${designations.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `designations ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getOneDesignationsById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(designations.getOneById);

    res.set("Content-Range", `designations 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateDesignations = async (req, res) => {
  const {
    id,
    designation,
    codeDesignation,
    PourcentageTVA,
    Etat,
    PosteTVA,
    ModifierPar,
  } = req.body;
  console.log(req.body);

  if (
    id == null ||
    designation == null ||
    codeDesignation == null ||
    PourcentageTVA == null ||
    Etat == null ||
    ModifierPar == null
  ) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("codeDesignation", getSql().VarChar, codeDesignation)
      .input("PourcentageTVA", getSql().VarChar, PourcentageTVA)
      .input("PosteTVA", getSql().VarChar, PosteTVA)
      .input("Etat", getSql().VarChar, Etat)
      .input("id", getSql().Int, req.params.id)
      .query(designations.update);

    res.json({
      message: "Designation updated successfully",
      designation,
      codeDesignation,
      PourcentageTVA,
      Etat,
      PosteTVA,
      ModifierPar,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

/**
 {
    "ModifierPar": "y.ihrai",
    "designation": "test desgnation",
    "codeDesignation": "99999999",
    "PourcentageTVA": "1.23",
    "PosteTVA": "65885"
}
}
 */

exports.createDesignations = async (req, res) => {
  const { designation, codeDesignation, PourcentageTVA, PosteTVA } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("designation", getSql().VarChar, designation)
      .input("codeDesignation", getSql().VarChar, codeDesignation)
      .input("PourcentageTVA", getSql().VarChar, PourcentageTVA)
      .input("PosteTVA", getSql().VarChar, PosteTVA)

      .query(designations.create);
    console.log("errour");
    res.json({
      id: "",
      designation,
      codeDesignation,
      PourcentageTVA,
      PosteTVA,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
