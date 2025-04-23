const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan"); // Typo: Corrected 'morgen' to 'morgan'
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Configuration du CORS pour permettre les requêtes depuis n'importe quelle origine avec certaines méthodes HTTP
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
  })
);

const allowedIPs = ["10.111.3.113", "10.111.1.68", "127.0.0.1"]; // List of allowed IPs

// Middleware to allow only specific IPs
const allowIPs = (req, res, next) => {
  // Get the client's IP address
  const clientIP = req.headers["x-forwarded-for"] || req.ip;

  // Check if the client's IP is in the allowed IPs
  if (allowedIPs.includes(clientIP)) {
    return next(); // Allow access
  } else {
    return res.status(403).send("Access denied: Your IP is not allowed."); // Block access
  }
};

// Use the allowIPs middleware
// app.use(allowIPs);
// Middleware de logging des requêtes HTTP en mode 'dev'
app.use(morgan("dev"));

// Middleware pour parser le corps des requêtes en JSON
app.use(bodyParser.json());

// Middleware pour parser les cookies
app.use(cookieParser());

// // Import des routes spécifiques pour différentes fonctionnalités de l'application
const FournisseursRoute = require("./routers/FournisseursRoute");
const RibTemporaireRoute = require("./routers/RibTemporaireRoute");
const RibFournisseursRoute = require("./routers/RibFournisseursRoute");
const RibAtnerRoute = require("./routers/RibAtnerRoute");
const UsersRoute = require("./routers/UsersRoute");
const OrdervirementsRoute = require("./routers/OrdervirementsRoute");
const OrdervirementsFond = require("./routers/OrdervirementsFond");
const factures = require("./routers/factures");
const VirementsRoute = require("./routers/VirementsRoute");
const VirementsFondRoute = require("./routers/VirementsFondRoute");
const AvancePayer = require("./routers/AvancePayerRoute");
const ChantierRoute = require("./routers/ChantierRoute");
const FactureSaisieRoute = require("./routers/FactureSaisieRoute");
const FicheNavetteRoute = require("./routers/FicheNavetteRoute"); // Typo: Corrected 'FicheNavetteRouer' to 'FicheNavetteRoute'
const SuivieFactureRoute = require("./routers/SuivieFactureRoute");
const ChequeRoute = require("./routers/ChequeRoute");
const EspeceRoute = require("./routers/EspeceRoute");
const AvanceRoute = require("./routers/AvanceRoute");
const EcheanceReelRoute = require("./routers/EcheanceReelRoute");
const EcheanceLoiRoute = require("./routers/EcheanceLoiRoute");
const AttestationRoute = require("./routers/AttestationRoute"); // Typo: Corrected 'AttestaionRoute' to 'AttestationRoute'
const charts = require("./routers/charts"); // Typo: Corrected 'AttestaionRoute' to 'AttestationRoute'

/**    Alerts V2 */

const Alert1Route = require("./routers/alerts");
const getfatcturelog = require("./routers/newlogFacture");
const sumFA = require("./routers/SumFA");
const StFournisseur = require("./routers/StFournisseur");
const StChantier = require("./routers/StChantier");
const AtnerPaiements = require("./routers/atnerPaiements");
const Designations = require("./routers/Designations");
const Echeance = require("./routers/EcheanceFournisseur");
const TMPFournisseur = require("./routers/TMPFournisseur");

// // Utilisation des routes importées avec des chemins spécifiques
app.use("/", AttestationRoute);
app.use("/", FournisseursRoute);
app.use("/", RibTemporaireRoute);
app.use("/", RibFournisseursRoute);
app.use("/", RibAtnerRoute);
app.use("/", UsersRoute);
app.use("/", OrdervirementsRoute);
app.use("/", OrdervirementsFond);
app.use("/", factures);
app.use("/", VirementsRoute);
app.use("/", VirementsFondRoute);
app.use("/", AvancePayer);
app.use("/", ChantierRoute);
app.use("/", FicheNavetteRoute);
app.use("/", FactureSaisieRoute);
app.use("/", SuivieFactureRoute);
app.use("/", ChequeRoute);
app.use("/", EspeceRoute);
app.use("/", AvanceRoute);
app.use("/", EcheanceReelRoute);
app.use("/", EcheanceLoiRoute);

/**  Alert V2 */
app.use("/", Alert1Route);
app.use("/", charts);
app.use("/", getfatcturelog);
app.use("/", sumFA);
app.use("/", StFournisseur);
app.use("/", StChantier);
app.use("/", AtnerPaiements);
app.use("/", Designations);
app.use("/", Echeance);
app.use("/", TMPFournisseur);

// Configuration du port d'écoute pour le serveur, en utilisant le port spécifié dans l'environnement ou le port 8080 par défaut
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node API listening to port : ${port}`);
});

console.log("Helloworld"); // Message de test
