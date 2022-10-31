const { getConnection, getSql } = require("../database/connection");
const { virements } = require("../database/querys");

exports.createVirements = async (req, res) => {
  console.log(req.body);
  return res.json({ id: "" });
  //   try {
  //     const pool = await getConnection();

  //     await pool
  //       .request()
  //       .input("id", getSql().VarChar, generateOvID(await getOrderCountbyYear()))
  //       .input("ribAtner", getSql().Int, ribAtner)

  //       .query(ordervirements.create);
  //     console.log("errour");
  //     res.json({
  //       id: "",
  //       ribAtner,
  //     });
  //   } catch (error) {
  //     res.status(500);
  //     res.send(error.message);
  //   }
};

exports.getVirements = async (req, res) => {
  res.set("Content-Range", `virements 0-1/1`);

  return res.json([{ id: "id" }]);
};
