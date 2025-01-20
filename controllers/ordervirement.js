const { getConnection, getSql } = require("../database/connection");
const { ordervirements } = require("../database/OrderVirementQuery");
const html_to_pdf = require("html-pdf-node");
const fs = require("fs");
const { ToWords } = require("to-words");
const { toUpper } = require("lodash");
// Ajoute des zéros aux nombres pour le formatage
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

// Ajoute un zéro devant les nombres à un chiffre
const addZero = (num) => {
  let str = num.toString();
  if (str.length === 1) {
    //console.log("inside if:" + str.length);
    return "0" + "" + str;
  }
  return str;
};
// Ajoute deux zéros devant les nombres
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
// Récupère l'ordre de virements  par année
const getOrderCountbyYear = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ordervirements.getCountByYear);
    // req.countyear = result.recordset[0].count;
    console.log(ordervirements.getCountByYear);
    // console.log(req.countyear);
    return result.recordset[0].count;
  } catch (error) {
    // res.status(500);
    console.log(error.message);
    // res.send(error.message);
  }
};
// Middleware pour obtenir le nombre des ordre de virements
exports.getOrderCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ordervirements.getCount);
    req.count = result.recordset[0].count;
    // console.log(req.count);
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
// Génère un  id des ordres de virements
const generateOvID = (id) => {
  let currentDate = new Date();
  let Id = addTwoZero(id);
  let day = addZero(currentDate.getDate());
  let month = addZero(currentDate.getMonth() + 1);
  let year = currentDate.getFullYear();

  return `OV${Id}-${day}-${month}-${year}`;
};
// Crée un nouvel ordre de virement
exports.createOrderVirements = async (req, res) => {
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
      .query(ordervirements.create);
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
// Récupère les ordres de virement
exports.getorderVirements = async (req, res) => {
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
    console.log(`${ordervirements.getAll} ${queryFilter} Order by ${sort[0]} ${
      sort[1]
    }
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);
    const result = await pool.request().query(
      `${ordervirements.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `ordervirements ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

async function updateRestitWhenAnnuleVirement(orderVirementId) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("orderVirementId", getSql().VarChar, orderVirementId)

      .query(ordervirements.updateRestitWhenAnnuleV);

    console.log(
      `${virements.updateRestitWhenAnnuleV} '${orderVirementId}' , '${nom}'`
    );
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

async function ChangeEtatAnnulerAvanceFacture(orderVirementId) {
  try {
    const pool = await getConnection();

    // Requête 1 : Mise à jour de DAF_Avance
    let query1 = `
      UPDATE DAF_Avance
      SET Etat = 'Annuler'
      WHERE id IN (
        SELECT idavance
        FROM DAF_RestitAvance
        WHERE Etat NOT IN ('Reglee')
          AND ModePaiement = @orderVirementId
      )
      AND etat NOT IN ('Annuler')
    `;

    // Requête 2 : Mise à jour de DAF_FactureSaisie
    let query2 = `
   UPDATE  fs
SET  fs.AcompteReg -= rs.Montant
FROM DAF_FactureSaisie fs
INNER JOIN DAF_RestitAvance rs ON fs.id = rs.idFacture
WHERE rs.ModePaiement = @orderVirementId
  AND rs.Etat  IN ('Annuler');
    `;

    // Préparation des requêtes
    const request1 = pool.request();
    request1.input("orderVirementId", orderVirementId);

    const request2 = pool.request();
    request2.input("orderVirementId", orderVirementId);

    // Exécution des requêtes
    console.log("Requête SQL exécutée 1:", query1);
    const result1 = await request1.query(query1);
    console.log("Résultat de la requête 1:", result1);

    console.log("Requête SQL exécutée 2:", query2);
    const result2 = await request2.query(query2);
    console.log("Résultat de la requête 2:", result2);

    return {
      result1: result1.recordset,
      result2: result2.recordset,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de l'état :", error.message);
    throw error;
  }
}
// Met à jour un ordre de virement

exports.updateOrderVirements = async (req, res) => {
  const { ribAtner, etat, directeursigne, dateExecution } = req.body;
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
      .input("dateExecution", getSql().Date, dateExecution)
      .input("id", getSql().VarChar, req.params.id)
      .query(ordervirements.update);

    if (etat == "Annuler") {
      // updateRestitWhenAnnuleVirement(req.params.id);
      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirements.updateVirementsAnnuler);

      // await pool
      //   .request()
      //   .input("id", getSql().VarChar, req.params.id)
      //   .query(ordervirements.updateRasAnnuler);

      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirements.updateLogFactureAnnuler);
      await pool
        .request()
        .input("id", getSql().VarChar, req.params.id)
        .query(ordervirements.updateordervirementAnnuler);
    }
    // ChangeEtatAnnulerAvanceFacture(req.params.id);

    res.json({
      ribAtner,
      etat,
      dateExecution,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
// Récupère un ordre par son ID
exports.getOneOrderById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(ordervirements.getOne);

    res.set("Content-Range", `ordervirements 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
// Récupère les ordres de virement en cours
exports.orderVirementsEnCours = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(ordervirements.orderVirementsEnCours);

    res.set("Content-Range", `ordervirements 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
// Récupère les états des ordres de virement
exports.orderVirementsEtat = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(ordervirements.orderVirementsEtat);

    res.set("Content-Range", `ordervirements 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
// Imprime l'ordre de virement
exports.PrintOrderVirement = async (req, res) => {
  const toWords = new ToWords({
    localeCode: "fr-FR",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      currencyOptions: {
        // can be used to override defaults for the selected locale
        // name: 'DIRHAMS',
        plural: "DIRHAMS",
        fractionalUnit: {
          // name: 'CENTIMES',
          plural: "CENTIMES",
          symbol: "",
        },
      },
    },
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
    resulsumvirement: function (data) {
      // Fonction pour formater les données avec des virgules
      return data.toLocaleString();
    },
  };

  let filter = req.query.ordervirment || "{}";
  filter = JSON.parse(filter);

  try {
    const pool = await getConnection();
    let html = ``;
    let result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(ordervirements.getHeaderPrint);
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

    result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(ordervirements.getBodyPrint);
    printData.body = result.recordset;

    let resultsumov = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(ordervirements.getSumVirmentPrint);

    printData.resulsumvirement = resultsumov.recordset[0].SumVirement;

    let trdata = "";
    // const wordToNumber = (x) => {
    //   let res = "";
    //   let to_words = toWords.convert(x).toLocaleUpperCase();
    //   console.log("to_words", to_words);
    //   if (to_words.includes("VIRGULE")) {
    //     let [integerPart, decimalPart] = to_words.split("VIRGULE");

    //     // Vérifie si decimalPart est null et le remplace par une chaîne vide
    //     decimalPart = decimalPart || "";

    //     // res = integerPart + " DIRHAMS";
    //     res = integerPart;
    //     // Traitement de la partie décimale
    //     if (decimalPart) {
    //       let decimalInWords = "";
    //       if (decimalPart.trim() === "UN") {
    //         decimalInWords = "DIX CENTIMES";
    //       } else if (decimalPart.trim() === "DEUX") {
    //         decimalInWords = "VINGT CENTIMES";
    //       } else if (decimalPart.trim() === "TROIS") {
    //         decimalInWords = "TRENTE CENTIMES";
    //       } else if (decimalPart.trim() === "QUATRE") {
    //         decimalInWords = "QUARANTE CENTIMES";
    //       } else if (decimalPart.trim() === "CINQ") {
    //         decimalInWords = "CINQUANTE CENTIMES";
    //       } else if (decimalPart.trim() === "SIX") {
    //         decimalInWords = "SOIXANTE CENTIMES";
    //       } else if (decimalPart.trim() === "SEPT") {
    //         decimalInWords = "SOIXANTE-DIX CENTIMES";
    //       } else if (decimalPart.trim() === "HUIT") {
    //         decimalInWords = "QUATRE-VINGTS CENTIMES";
    //       } else if (decimalPart.trim() === "NEUF") {
    //         decimalInWords = "QUATRE-VINGT-DIX CENTIMES";
    //       } else {
    //         // decimalInWords =decimalPart + " CENTIMES";
    //         decimalInWords = decimalPart;
    //       }

    //       // res += " ET " + decimalInWords;
    //     }
    //   } else {
    //     res = to_words;
    //   }

    //   return res;
    // };

    console.log("printData:", printData);
    let nom = printData.header[0].nom;
    if (nom != "BMCE") {
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

      html = `
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
                ${
                  // wordToNumber(parseFloat(printData.resulsumvirement))
                  toUpper(
                    toWords.convert(
                      parseFloat(printData.resulsumvirement.replace(",", "."))
                    )
                  )
                } 
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
    } else {
      printData.body.forEach((virement, index) => {
        trdata += `
              <tr>
                <td>${virement.nom}</td>
                <td class="buttom-table-center-left">${virement.rib.replaceAll(
                  " ",
                  ""
                )}</td>
                <td class="amount buttom-table-center-left">${
                  virement.montantVirementModifier
                }</td>
            </tr>   
        `;
      });

      html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ATNER Document - BMCE Format</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin:5px 25px 0px 25px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 2px solid black;
            padding: 8px;
            text-align: left;
        }
        .header, .footer {
            text-align: center;
            font-weight: bold;
        }
        
        .footer{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
        .left-top-table{
            font-size: 17px;
            font-weight: 600;
        }

        .buttom-table-center-left {
            text-align: center;
            font-size: 17px;
            font-weight: 600;
        }
        .amount {
            text-align: right;
        }
    </style>
</head>
<body>

    <div class="header">
        <img src="./logo.png" alt="atner logo" width="15%" alt="" srcset="">
    </div>

    <p>Date Ordre: <b>${today}</b></p>

    <table>
        <tr>
            <td>RAISON SOCIAL</td>
            <td class="left-top-table">ATNER</td>
        </tr>
        <tr>
            <td>RIB ORDONNATEUR</td>
            <td class="left-top-table">${printData.header[0].rib.replaceAll(
              " ",
              ""
            )}</td>
        </tr>
        <tr>
            <td>NOMBRE TOTAL D'OPERATIONS</td>
            <td class="left-top-table">${printData.body.length}</td>
        </tr>
        <tr>
            <td>MONTANT TOTAL D'OPERATIONS</td>
            <td class="left-top-table">${
              printData.header[0].totalformater
            }<br>${
        // wordToNumber(parseFloat(printData.resulsumvirement))
        toUpper(
          toWords.convert(
            parseFloat(printData.resulsumvirement.replace(",", "."))
          )
        )
      } </td>
        </tr>
        <tr>
            <td>LIBELE OPERATIONS</td>
            <td class="left-top-table">${printData.header[0].id}</td>
        </tr >
    </table>

    <p>Veuillez Par le débit de notre compte, effectuer les virements en faveur des bénéficiaires</p>

    <table>
        <thead>
            <tr>
                <th>Nom Bénéficiaire</th>
                <th>RIB Bénéficiaire</th>
                <th class="amount">Montant Virement</th>
            </tr>
        </thead>
        <tbody>
           ${trdata} 
        </tbody>
      </table>
      <div class="footer">
          <p>Signatures autorisées :</p>
          <p>Authentification Signatures "Cachet Agence":</p>
      </div>

</body>
</html>

      `;
    }

    fs.writeFileSync(`${__dirname}\\assets\\ordervirment.html`, html);

    let file = { url: `${__dirname}\\assets\\ordervirment.html` };
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      // console.log("PDF Buffer:-", pdfBuffer);
      // printData.PDFBuffer = pdfBuffer;
      printData.base64 = pdfBuffer.toString("base64");

      let pdfPath =
        "\\\\10.200.1.21\\02_Exe\\00 - Reporting\\11 - Scripts Traitements Compta\\OV\\" +
        printData.header[0].id +
        ".pdf";
      fs.writeFileSync(pdfPath, pdfBuffer);
      printData.path = pdfPath;
      printData.edit = true;
      // console.log(printData);
      console.log("fin", __dirname);
      res.set("Content-Range", `ordervirement 0 - 1/1`);
      res.json(printData);
    });
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
    res.set("Content-Range", `chantier 0-1/1`);

    res.json(result.recordset);
    console.log(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
