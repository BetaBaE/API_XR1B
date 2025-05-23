const { getConnection, getSql } = require("../database/connection");
const { ordervirementsFond } = require("../database/ordervirementsFondQuery");
const html_to_pdf = require("html-pdf-node");
const fs = require("fs");
const { ToWords } = require("to-words");
const { DateTime } = require("mssql");

const addZerotonumbers = (num) => {
  let str = num.toString();
  if (str.includes(".")) {
    let ary = str.split(".");
    if (ary[1].length < 2) {
      return str + "" + "00";
    } else if (ary[1].length == 2) {
      return str + "" + "0";
    }
  } else {
    return str + ".000";
  }

  return str;
};

const addZero = (num) => {
  let str = num.toString();
  if (str.length === 1) {
    //console.log("inside if:" + str.length);
    return "0" + "" + str;
  }
  return str;
};

const addTwoZero = (num) => {
  let str = num.toString();
  if (str.length === 1) {
    //console.log("inside if:" + str.length);
    return "00" + "" + str;
  } else if (str.length === 2) {
    //console.log("inside if:" + str.length);
    return "0" + "" + str;
  }
  return str;
};

const getOrderCountbyYear = async () => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(ordervirementsFond.getCountByYear);
    // req.countyear = result.recordset[0].count;
    console.log(ordervirementsFond.getCountByYear);
    // console.log(req.countyear);
    return result.recordset[0].count;
  } catch (error) {
    // res.status(500);
    console.log(error.message);
    // res.send(error.message);
  }
};

exports.getOrderCountFond = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ordervirementsFond.getCount);
    req.count = result.recordset[0].count;
    // console.log(req.count);
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

const generateOvID = (id) => {
  let currentDate = new Date();
  let Id = addTwoZero(id);
  let day = addZero(currentDate.getDate());
  let month = addZero(currentDate.getMonth() + 1);
  let year = currentDate.getFullYear();

  return `OVF${Id}-${day}-${month}-${year}`;
};

exports.createOrderVirementsFond = async (req, res) => {
  const { ribAtner, Redacteur } = req.body;
  console.log(getOrderCountbyYear());
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("id", getSql().VarChar, generateOvID(await getOrderCountbyYear()))
      .input("directeursigne", getSql().VarChar, req.body.directeursigne)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("ribAtner", getSql().Int, ribAtner)

      .query(ordervirementsFond.create);
    console.log("errour");
    res.json({
      id: "",
      ribAtner,
      Redacteur,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getorderVirementsFond = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";

    if (filter.id) {
      queryFilter += ` and ov.id like('%${filter.id}%')`;
    }
    if (filter.rib) {
      queryFilter += ` and rib like('%${filter.rib}%')`;
    }
    if (filter.nom) {
      queryFilter += ` and nom like('%${filter.nom}%')`;
    }
    if (filter.directeursigne) {
      queryFilter += ` and directeursigne like('%${filter.directeursigne}%')`;
    }
    if (filter.etat) {
      queryFilter += ` and etat like('%${filter.etat}%')`;
    }

    console.log(queryFilter);

    const pool = await getConnection();
    console.log(`${ordervirementsFond.getAll} ${queryFilter} Order by ${
      sort[0]
    } ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);
    const result = await pool.request().query(
      `${ordervirementsFond.getAll} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `ordervirementsFond ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateOrderVirementsFond = async (req, res) => {
  const { ribAtner, etat, directeursigne } = req.body;
  if (ribAtner == null || etat == null) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("ribAtner", getSql().Int, ribAtner)
      .input("etat", getSql().VarChar, etat)
      .input("directeursigne", getSql().VarChar, directeursigne)
      .input("id", getSql().VarChar, req.params.id)
      .query(ordervirementsFond.update);

    if (etat == "Reglee") {
      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirementsFond.updateVirements);
      await pool.request().input("id", getSql().VarChar, req.params.id);

      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirementsFond.updateDateExecution);

      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirementsFond.updatvirementRegler);
    } else if (etat == "Annuler") {
      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirementsFond.updateVirementsAnnuler);

      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirementsFond.updateordervirementAnnuler);
    }

    res.json({
      ribAtner,
      etat,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneOrderByIdFond = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(ordervirementsFond.getOne);

    res.set("Content-Range", `ordervirementsFond 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.orderVirementsEnCoursFond = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(ordervirementsFond.orderVirementsEnCours);

    res.set("Content-Range", `ordervirements 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.orderVirementsEtatFond = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(ordervirementsFond.orderVirementsEtat);

    res.set("Content-Range", `ordervirements 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getfacturebyordervirement = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(ordervirements.getfacturebyordervirement);
    console.log(`${ordervirements.getfacturebyordervirement}`, req.params.id);
    console.log("ordervirement id");
    res.set("Content-Range", `cahntier 0-1/1`);

    res.json(result.recordset);
    console.log(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.PrintOrderVirementFond = async (req, res) => {
  const toWords = new ToWords({
    localeCode: "fr-FR",
  });

  function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  let options = { format: "A4" };

  let printData = {
    header: {},
    body: [],
    edit: false,
    path: "",
  };
  let filter = req.query.ordervirment || "{}";
  filter = JSON.parse(filter);

  try {
    const pool = await getConnection();

    let result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(ordervirementsFond.getHeaderPrint);
    printData.header = result.recordset;

    let date = new Date();

    //console.log(addZero(1));

    let year = date.getFullYear();
    let month = addZero(date.getMonth() + 1);
    let day = addZero(date.getDate());
    let hour = addZero(date.getHours());
    let min = addZero(date.getMinutes());
    let sec = addZero(date.getSeconds());

    let concat = year + "" + month + "" + day + "" + hour + "" + min + "" + sec;

    let currentDate = new Date();
    let today = `${addZero(currentDate.getDate())}/${addZero(
      currentDate.getMonth() + 1
    )}/${addZero(currentDate.getFullYear())}`;

    // let date = `${currentDate.getFullYear()}${
    //   currentDate.getMonth.length > 1
    //     ? currentDate.getMonth + 1
    //     : "0" + (currentDate.getMonth + 1).toString()
    // }${
    //   currentDate.getDay.length > 1
    //     ? currentDate.getDay
    //     : "0" + currentDate.getDay.toString()
    // }${
    //   currentDate.getHours.length > 1
    //     ? currentDate.getHours
    //     : "0" + currentDate.getHours.toString()
    // }${
    //   currentDate.getMinutes.length > 1
    //     ? currentDate.getMinutes
    //     : "0" + currentDate.getMinutes.toString()
    // }${
    //   currentDate.getSeconds.length > 1
    //     ? currentDate.getSeconds
    //     : "0" + currentDate.getSeconds.toString()
    // }`;
    result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(ordervirementsFond.getBodyPrint);
    printData.body = result.recordset;
    let trdata = "";
    const wordToNumber = (x) => {
      let res = "";
      let to_words = toWords.convert(x).toLocaleUpperCase();

      if (to_words.includes("VIRGULE")) {
        let [integerPart, decimalPart] = to_words.split("VIRGULE");

        // Vérifie si decimalPart est null et le remplace par une chaîne vide
        decimalPart = decimalPart || "";

        res = integerPart + " DIRHAMS";

        // Traitement de la partie décimale
        if (decimalPart) {
          let decimalInWords = "";

          if (decimalPart.trim() === "UN") {
            decimalInWords = "DIX CENTIMES";
          } else if (decimalPart.trim() === "DEUX") {
            decimalInWords = "VINGT CENTIMES";
          } else if (decimalPart.trim() === "TROIS") {
            decimalInWords = "TRENTE CENTIMES";
          } else if (decimalPart.trim() === "QUATRE") {
            decimalInWords = "QUARANTE CENTIMES";
          } else if (decimalPart.trim() === "CINQ") {
            decimalInWords = "CINQUANTE CENTIMES";
          } else if (decimalPart.trim() === "SIX") {
            decimalInWords = "SOIXANTE CENTIMES";
          } else if (decimalPart.trim() === "SEPT") {
            decimalInWords = "SOIXANTE-DIX CENTIMES";
          } else if (decimalPart.trim() === "HUIT") {
            decimalInWords = "QUATRE-VINGTS CENTIMES";
          } else if (decimalPart.trim() === "NEUF") {
            decimalInWords = "QUATRE-VINGT-DIX CENTIMES";
          } else {
            decimalInWords = decimalPart + " CENTIMES";
          }

          res += " ET " + decimalInWords;
        }
      } else {
        res = to_words + " DIRHAMS";
      }

      return res;
    };
    console.log(printData);

    printData.body.forEach((virement, index) => {
      trdata += `
              <tr>
                <td class="tdorder">${index + 1}</td>
                <td class="tdorder">${virement.nom}</td>
                <td class="tdorder">${virement.rib}</td>
                <td class="tdorder montant">${numberWithSpaces(
                  virement.montantVirementModifier
                )}</td>
              </tr>
        `;
    });

    let html = `
    <!doctype html>
    <html>
      <head>
          <style>
              .container {
                height : 29,4cm;
                width : 21cm;
                padding: 2.1cm 2.1cm 0.7cm 2.1cm;
                display: flex;
                flex-direction: column;
                font-family: Calibri, sans-serif;
                font-size :16px;
              }
              .logo {
                width: 10%;
                margin-bottom : 10px;
              }
              .date {
                font-size: 16px;
                font-weight: 900;
              }
              .discription {
                font-size: 16px;
              }

              .table {
                width: 100%;
                display: flex;
                justify-content: center;
              }
              table {
                width: 90%;
                align-self: center;
              }
              .torder,
              .thorder,
              .tdorder {
                border: 1px solid black;
                border-collapse: collapse;
                text-align: center;
                padding: 0px 32px;

              }
              .tdorder{
                padding : 10px 0px;
                font-size :4 px
              }
              th  {
                font-size : 16px;
                background : #878787;
              }
              td {
                text-align: center;
                padding: 2px 0;
              }
              .footer {
                width: 21cm;
                position: fixed;
                bottom:0;
                text-align : center;
                font-size : 18px;
              }
              .montant {
                padding :0px 10px;
                text-align: right;
              }
              .datalist {
                border: 0;
                background-color: #fafafb;
                font-size: 12px;
                text-align: center;
              }
          </style>
    
      </head>
      <body>
        <div class="container">
          <div>
            <img class="logo" src="./logo.png" alt="atner logo" />
          </div>
          <hr />
          <div class="date">
            <p dir="rtl">
              Rabat le &emsp;
              ${today}
            </p>
            <p dir="rtl">A l'attention de Monsieur le Directeur
            <br/>du Centre d'Affaires
            <br/>${printData.header[0].nom}</p>
            <p>Objet: ${printData.header[0].id}</p>
          </div>
        <div class="discription">
          <p>Monsieur,</p>
          <div class="atner-compte">
            <span>&emsp;&emsp;&emsp;Par le débit de notre compte N° :&emsp;</span>
            <span>${printData.header[0].rib}</span>
          </div>
          <p>
            &emsp;&emsp;&emsp;nous vous prions de bien vouloir traiter les
            virements détaillés dans le tableau ci-dessous:
          </p>
        </div>

        <div class="table">
          <table class="torder">
            <thead>
              <tr>
                <th class="thorder">N°</th>
                <th class="thorder">Bénéficiaire</th>
                <th style="width: 40%;">N° du compte</th>
                <th class="thorder">Montant</th>
              </tr>
            </thead>
            <tbody>
            ${trdata}
            </tbody>
            <tfoot>
              <th class="thorder">Total</th>
              <th colspan="2" class="thorder ">
                ${wordToNumber(printData.header[0].total)}
              </th>
              <th class="thorder montant">${numberWithSpaces(
                printData.header[0].totalformater
              )}</th>
            </tfoot>
          </table>
        </div>
        <div class="discription">
          <p>Salutations distinguées</p>
          <b>
            <p>Le Directeur Général <br/>
            ${printData.header[0].directeursigne}
            </p>
          </b>
        </div>
        <div class="footer">
          <p>S.A.R.L. au capital social 100.000.000,00 DH
          <br/>Siége social : 24, route du sud, MIDELT
          <br/> R.C. Midelt n°479-Patente n°18906900-I.F n° : 04150014-C.N.S.S n° 1280510
          </p>
        </div>
      </div>
      </body>
      </html>
    `;
    fs.writeFileSync(`${__dirname}\\assets\\ordervirment.html`, html);

    let file = { url: `${__dirname}\\assets\\ordervirment.html` };
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      // console.log("PDF Buffer:-", pdfBuffer);
      printData.base64 = pdfBuffer.toString("base64");
      let pdfPath =
        "\\\\10.200.1.21\\02_Exe\\00 - Reporting\\11 - Scripts Traitements Compta\\OVF\\" +
        printData.header[0].id +
        " " +
        concat +
        ".pdf";
      fs.writeFileSync(pdfPath, pdfBuffer);
      printData.path = pdfPath;
      printData.edit = true;
      // console.log(printData);
      console.log("fin", __dirname);
      res.set("Content-Range", `ordervirementFond 0 - 1/1`);
      res.json(printData);
    });
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
