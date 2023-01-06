const express = require("express");
const app = express();
const cors = require("cors");
const morgen = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
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
const factures = require("./routers/factures");
const virements = require("./routers/virements");
const logFactures = require("./routers/logfacture");

app.use("/", fournissues);
app.use("/", ribTemporaire);
app.use("/", ribFournisseurs);
app.use("/", ribAtner);
app.use("/", users);
app.use("/", orderVirements);
app.use("/", factures);
app.use("/", virements);
app.use("/", logFactures);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node API listening to port : ${port}`);
});

console.log("Helloworld");
