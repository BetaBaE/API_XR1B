const express = require("express");
const app = express();
const cors = require("cors");
const morgen = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// CORS middleware for handling Cross-Origin Resource Sharing
app.use(
  cors({
    origin: "*", // Allow requests from any origin (you might want to restrict this in production)
    methods: ["GET", "PUT", "POST", "DELETE"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "Range"], // Allow these headers in the request
    exposedHeaders: ["Content-Range", "X-Content-Range"], // Allow these headers to be exposed
    credentials: true, // Allow credentials to be sent with requests (e.g., cookies)
  })
);

// // middelware
app.use(morgen("dev"));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

const fournissues = require("./routers/fournisseurs");
const ribTemporaire = require("./routers/ribTemporaire");
const ribFournisseurs = require("./routers/ribFournisseurs");
const ribAtner = require("./routers/ribAtner");
const users = require("./routers/users");
const orderVirements = require("./routers/ordervirements");
const ordervirementsFond = require("./routers/ordervirementsFond");
const factures = require("./routers/factures");
const virements = require("./routers/virements");
const virementsFond = require("./routers/virementsFond");
const logFactures = require("./routers/logfacture");
const chantier = require("./routers/Chantier");
const factureRes = require("./routers/FactureRes");
const ficheNavette = require("./routers/FactureFicheNavette");
const SuivieFacture = require("./routers/SuivieFactureRoute");
const cheque = require("./routers/Cheque");
const espece = require("./routers/Espece");
const BL = require("./routers/BLRoute");
const avancevirement = require("./routers/AvanceVirementroute");
const EcheanceReel = require("./routers/EcheanceReel");
const EcheanceLoi = require("./routers/EcheanceLoi");
const avanceespece = require("./routers/AvanceEspeceRoute");
const Attestaion = require("./routers/Attestaion");

app.use("/", Attestaion);
app.use("/", fournissues);
app.use("/", virementsFond);
app.use("/", ordervirementsFond);
app.use("/", EcheanceLoi);
app.use("/", ribTemporaire);
app.use("/", ribFournisseurs);
app.use("/", ribAtner);
app.use("/", users);
app.use("/", orderVirements);
app.use("/", factures);
app.use("/", virements);
app.use("/", logFactures);
app.use("/", chantier);
app.use("/", factureRes);
app.use("/", ficheNavette);
app.use("/", SuivieFacture);
app.use("/", cheque);
app.use("/", espece);
app.use("/", avancevirement);
app.use("/", EcheanceReel);
app.use("/", avanceespece);
app.use("/", BL);
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node API listening to port : ${port}`);
});

console.log("Helloworld");
