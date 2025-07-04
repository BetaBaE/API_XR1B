const { log } = require("console");
const { getConnection, getSql } = require("../database/connection");
const html_to_pdf = require("html-pdf-node");
const fs = require("fs");
const path = require("path");
const {
  transfers,
  beneficiaries,
  transferItems,
} = require("../database/madmass");
const {
  generateHeader,
  generateBody,
  generateFooter,
  formatDateTime,
} = require("./utils/madmass");

// Mass Transfers CRUD
exports.getTransfersCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(transfers.getCount);

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

exports.getAllTransfers = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    log("Range:", filter);
    let queryFilter = "";

    if (filter.StatusA) {
      queryFilter += ` AND Status IN (${filter.StatusA})`;
    }
    const pool = await getConnection();
    const result = await pool.request().query(
      `${transfers.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
            OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `transfers ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
exports.getAllTransfersPrint = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${transfers.getTransferCanPrint}`);
    res.set("Content-Range", `transfers 0-99/100`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getTransferById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Id", getSql().Int, req.params.id)
      .query(transfers.getById);

    if (result.recordset.length === 0) {
      return res.status(404).send("Transfer not found");
    }

    const items = await pool
      .request()
      .input("MassTransferId", getSql().Int, req.params.id)
      .query(transferItems.getByTransfer);

    res.json({
      ...result.recordset[0],
      beneficiaries: items.recordset,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Reference", getSql().VarChar, "MAD" + formatDateTime())
      .input("Description", getSql().VarChar, req.body.description)
      .input("DueDate", getSql().Date, req.body.dueDate)
      .input("CreatedBy", getSql().VarChar, req.body.redacteur)
      .input("BankCode", getSql().VarChar, req.body.bankCode || "504")
      .input(
        "AccountNumber",
        getSql().VarChar,
        req.body.accountNumber || "2121147161920003"
      )
      .input(
        "CompanyCode",
        getSql().VarChar,
        req.body.companyCode || "ATNERSARL"
      )
      .input(
        "BranchCode",
        getSql().VarChar,
        req.body.branchCode || "0018181002"
      )
      .query(transfers.create);

    res.status(201).json({ id: "" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateTransfer = async (req, res) => {
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("Id", getSql().Int, req.params.id)
      .input("Description", getSql().VarChar, req.body.Description)
      .input("DueDate", getSql().Date, req.body.DueDate)
      .input("Status", getSql().VarChar, req.body.Status)
      .input("BankCode", getSql().VarChar, req.body.BankCode)
      .input("AccountNumber", getSql().VarChar, req.body.AccountNumber)
      .input("CompanyCode", getSql().VarChar, req.body.CompanyCode)
      .input("BranchCode", getSql().VarChar, req.body.BranchCode)
      .query(transfers.update);

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Beneficiaries CRUD
exports.getBeneficiariesCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(beneficiaries.getCount);

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

exports.getAllBeneficiaries = async (req, res) => {
  try {
    let range = req.query.range || "[0,9999]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    log("Range:", range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    log("Range:", filter);
    let queryFilter = "";
    if (filter.LastName) {
      queryFilter += ` and LastName like('%${filter.LastName}%')`;
    }
    if (filter.FirstName) {
      queryFilter += ` and FirstName like('%${filter.FirstName}%')`;
    }
    if (filter.City) {
      queryFilter += ` and City like('%${filter.City}%')`;
    }
    if (filter.IdentityNumber) {
      queryFilter += ` and IdentityNumber like('%${filter.IdentityNumber}%')`;
    }

    const pool = await getConnection();

    const result = await pool.request().query(
      `${beneficiaries.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
            OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `beneficiaries ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getBeneficiariesNotInTransfer = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("massTransferId", getSql().Int, req.params.id)
      .query(`${beneficiaries.getBeneficiariesNotInTransfer} `);
    res.set("Content-Range", `beneficiaries 0-999/1000`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getBeneficiaryById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Id", getSql().Int, req.params.id)
      .query(beneficiaries.getById);

    if (result.recordset.length === 0) {
      return res.status(404).send("Beneficiary not found");
    }

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createBeneficiary = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("LastName", getSql().VarChar, req.body.lastName.trim())
      .input("FirstName", getSql().VarChar, req.body.firstName.trim())
      .input("IdentityType", getSql().VarChar, req.body.identityType || "1")
      .input("IdentityNumber", getSql().VarChar, req.body.identityNumber.trim())
      .input("Address", getSql().VarChar, req.body.address.trim())
      .input("City", getSql().VarChar, req.body.city.trim())
      .input("PostalCode", getSql().VarChar, req.body.postalCode)
      .input("Email", getSql().VarChar, (req.body.email ?? "").trim())
      .input("Phone", getSql().VarChar, req.body.phone.trim())
      .input("CreatedBy", getSql().VarChar, req.body.redacteur.trim())
      .query(beneficiaries.create);

    res.status(201).json({ id: "" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateBeneficiary = async (req, res) => {
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("Id", getSql().Int, req.params.id)
      .input("LastName", getSql().VarChar, req.body.LastName)
      .input("FirstName", getSql().VarChar, req.body.FirstName)
      .input("IdentityType", getSql().VarChar, req.body.IdentityType)
      .input("IdentityNumber", getSql().VarChar, req.body.IdentityNumber)
      .input("Address", getSql().VarChar, req.body.Address)
      .input("City", getSql().VarChar, req.body.City)
      .input("PostalCode", getSql().VarChar, req.body.PostalCode)
      .input("Email", getSql().VarChar, req.body.Email)
      .input("Phone", getSql().VarChar, req.body.Phone)
      .query(beneficiaries.update);

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Transfer Items Operations

exports.getTransferItemsCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(transferItems.getCount);

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

const getTheReference = async (id) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("massTransferId", getSql().Int, id)
      .query(transferItems.getTheRefrence);

    return result.recordset[0];
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

exports.getAllTransferItems = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    log("Range:", filter);
    let queryFilter = "";
    if (filter.LastName) {
      queryFilter += ` and LastName like('%${filter.LastName}%')`;
    }
    if (filter.FirstName) {
      queryFilter += ` and FirstName like('%${filter.FirstName}%')`;
    }
    if (filter.City) {
      queryFilter += ` and City like('%${filter.City}%')`;
    }
    if (filter.IdentityNumber) {
      queryFilter += ` and IdentityNumber like('%${filter.IdentityNumber}%')`;
    }

    const pool = await getConnection();

    const result = await pool.request().query(
      `${transferItems.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
            OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `beneficiaries ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const formatIdWithCount = (data) => {
  const paddedCount = data.count.toString().padStart(2, "0");
  return `${data.id}${paddedCount}`;
};
exports.addToTransfer = async (req, res) => {
  try {
    const reference = await getTheReference(req.body.MassTransferId);
    log("Reference:", reference);
    const pool = await getConnection();
    await pool
      .request()
      .input("MassTransferId", getSql().Int, req.body.MassTransferId)
      .input("BeneficiaryId", getSql().Int, req.body.BeneficiaryId)
      .input("Amount", getSql().Decimal(18, 2), req.body.amount)
      .input(
        "TransferReference",
        getSql().VarChar,
        formatIdWithCount(reference)
      )
      .query(transferItems.add);

    res.status(201).json({
      id: "",
      massTransferId: req.params.id,
      beneficiaryId: req.body.beneficiaryId,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.removeFromTransfer = async (req, res) => {
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("MassTransferId", getSql().Int, req.params.id)
      .input("BeneficiaryId", getSql().Int, req.params.beneficiaryId)
      .query(transferItems.remove);

    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// File Generation
exports.generateMadFile = async (req, res) => {
  try {
    const pool = await getConnection();
    const massTransferId = req.params.id;

    // Get header data
    const headerResult = await pool
      .request()
      .input("MassTransferId", getSql().Int, massTransferId)
      .query(transfers.getHeaderData);

    if (headerResult.recordset.length === 0) {
      return res.status(404).send("Transfer not found");
    }

    // Get body data
    const bodyResult = await pool
      .request()
      .input("MassTransferId", getSql().Int, massTransferId)
      .query(transferItems.getBodyData);

    // Generate file content
    const header = generateHeader(headerResult.recordset[0]);
    const body = generateBody(bodyResult.recordset);
    const footer = generateFooter({
      TotalAmount: headerResult.recordset[0].TotalAmount,
      BeneficiaryCount: bodyResult.recordset.length,
    });

    const fileContent = [header, body, footer].join("\r\n"); // ✅ Windows-style line endings
    const fileName = `MASS_${headerResult.recordset[0].Reference}.txt`; // ✅ Dynamic file name
    const filePath = path.join(
      "\\\\10.200.1.21\\02_Exe\\00 - Reporting\\11 - Scripts Traitements Compta\\MAD\\", // ✅ UNC path for network share
      fileName
    );

    // ✅ Ensure directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(filePath, fileContent, "utf8");

    // Update transfer status
    await pool
      .request()
      .input("MassTransferId", getSql().Int, massTransferId)
      .input("FilePath", getSql().VarChar, filePath)
      .query(transfers.markAsGenerated);

    // Return file for download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("File download failed:", err);
        res.status(500).send("File download failed");
      }
    });
  } catch (error) {
    console.error("Error generating MAD file:", error);
    res.status(500).send(error.message);
  }
};

// Generate PDF for MAD mass transfer
exports.generateMadPdf = async (req, res) => {
  let options = { format: "A4" };
  let printData = {};
  let html = ``;

  try {
    const pool = await getConnection();
    const massTransferId = req.params.id;

    // Get header data
    const headerResult = await pool
      .request()
      .input("MassTransferId", getSql().Int, massTransferId)
      .query(transfers.getHeaderData);

    if (headerResult.recordset.length === 0) {
      return res.status(404).send("Transfer not found");
    }

    // Get body data (count and total amount)
    const bodyResult = await pool
      .request()
      .input("MassTransferId", getSql().Int, massTransferId)
      .query(transferItems.getBodyData);

    // Format date
    const currentDate = new Date();
    const today = `${currentDate.getDate().toString().padStart(2, "0")}/${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${currentDate.getFullYear()}`;

    // Format amount with spaces
    const formatAmount = (amount) => {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };
    // log("Header Result:", headerResult.recordset[0]);
    // log("Body Result:", bodyResult.recordset[0]);
    // Generate HTML
    html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ATNER Banque Populaire de Rabat - Ordre d'exécution</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background-color: #f9f9f9;
        }
        
        .document {
            background-color: white;
            padding: 40px;
        }
        
        .header {
            margin-bottom: 30px;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .left-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
        }
        
        .logo {
          
        }
        
        .company-name {
            font-weight: bold;
            font-size: 18px;
        }
        
        .bank-name {
            font-weight: bold;
            font-size: 18px;
        }
        
        .address {
            margin-bottom: 5px;
        }
        
        .phone {
            margin-bottom: 20px;
        }
        
        .subject {
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .greeting {
            margin-bottom: 20px;
        }
        
        .content {
            margin-bottom: 30px;
        }
        
        .details {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .detail-label {
            font-weight: bold;
            flex: 1;
        }
        
        .detail-value {
            flex: 1;
            text-align: right;
        }
        
        .closing {
            margin-top: 30px;
        }
        
        .signature {
            margin-top: 20px;
            font-weight: bold;
        }
        
        .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .signature-box {
            border: 2px dashed #ccc;
            width: 200px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fafafa;
            font-style: italic;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <div class="header-top">
                <div class="left-section">
                    <div class="logo">
                       <img width="27%"  src="./logo.png" alt="Logo" />
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <div class="company-name">ATNER</div>
                        <div class="bank-name">Banque Populaire de Rabat</div>
                    </div>
                </div>
            </div>
            <div class="address">Villa 9, Impasse Al Melia Hay Ryad Rabat</div>
            <div class="phone">+212 535 58 06 42</div>
        </div>
        
        <div class="subject">
            <strong>Objet :</strong> Confirmation Ordre d'exécution des mises à disposition de masse
        </div>
        
        <div class="greeting">
            Messieurs,
        </div>
        
        <div class="content">
            Par la présente, veuillez exécuter le fichier de mises à disposition de masse transmis à votre Banque par le débit de notre compte dont le RIB 181 810 21211 471619 200 03 02, suivant les éléments ci-après :
        </div>
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Référence du fichier :</span>
                <span class="detail-value">${headerResult.recordset[0].Reference}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Objet de l'opération :</span>
                <span class="detail-value">MAD MASSE</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Nombre de mises à disposition :</span>
                <span class="detail-value">${headerResult.recordset[0].BeneficiaryCount}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Montant total (DH)</span>
                <span class="detail-value">${headerResult.recordset[0].TotalAmount}</span>
            </div>
        </div>
        
        <div class="closing">
            Nous vous prions d'agréer, Messieurs, nos salutations distinguées.
        </div>
        
        <div class="signature">
            Société ATNER représentée par Mr ZAMANI Youness
        </div>
        
        <div class="signature-section">
            <div>
                <strong>Date :</strong> ${today}
            </div>
            <div>
                <div style="margin-bottom: 10px;"><strong>Signature :</strong></div>
                <div class="signature-box">
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Save HTML to file (optional)
    fs.writeFileSync(`${__dirname}/assets/madmass.html`, html);

    // Generate PDF
    let file = { url: `${__dirname}/assets/madmass.html` };
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      printData.base64 = pdfBuffer.toString("base64");

      // Save PDF to network location
      let pdfPath = path.join(
        "\\\\10.200.1.21\\02_Exe\\00 - Reporting\\11 - Scripts Traitements Compta\\MAD\\",
        `MASS_${headerResult.recordset[0].Reference}.pdf`
      );

      fs.writeFileSync(pdfPath, pdfBuffer);
      printData.path = pdfPath;
      printData.title = `MASS_${headerResult.recordset[0].Reference}`;

      res.set("Content-Range", `madmass 0-1/1`);
      res.json(printData);
    });
  } catch (error) {
    console.error("Error generating MAD PDF:", error);
    res.status(500).send(error.message);
  }
};
