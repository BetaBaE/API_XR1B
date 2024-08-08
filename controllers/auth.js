// Importation des modules nécessaires
const { getConnection, getSql } = require("../database/connection");
const { Users } = require("../database/UserQuery");
const uuidv1 = require("uuid/v1");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const expressJwt = require("express-jwt");

dotenv.config(); // Chargement des variables d'environnement

// Middleware pour obtenir le nombre total d'utilisateurs
exports.getUserCount = async (req, res, next) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion à la base de données
    const result = await pool.request().query(Users.getCount); // Exécution de la requête pour compter les utilisateurs
    req.count = result.recordset[0].count; // Stockage du résultat dans req.count
    next(); // Passage au middleware suivant
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    console.log(error.message); // Affichage de l'erreur dans la console
    res.send(error.message); // Envoi de l'erreur au client
  }
};

// Fonction pour chiffrer un mot de passe avec un sel donné
const encryptPassword = (salt, password) => {
  return crypto.createHmac("sha1", salt).update(password).digest("hex");
};

// Fonction pour authentifier un utilisateur
const authenticate = (salt, plainText, hashed_password) => {
  return encryptPassword(salt, plainText) === hashed_password;
};

// Récupération des utilisateurs avec pagination, tri et filtrage
exports.getUsers = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.fullname) {
      queryFilter += ` and fullname like('%${filter.fullname}%')`;
    }
    if (filter.username) {
      queryFilter += ` and username like('%${filter.username}%')`;
    }
    if (filter.Role) {
      queryFilter += ` and Role like('%${filter.Role}%')`;
    }
    if (filter.isActivated) {
      queryFilter += ` and isActivated like('%${filter.isActivated}%')`;
    }

    const pool = await getConnection();
    console.log(`${Users.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);
    const result = await pool.request().query(
      `${Users.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `users ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset); // Envoi des résultats au client
  } catch (error) {
    res.send(error.message); // Envoi de l'erreur au client
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
  }
};

// Création d'un nouvel utilisateur
exports.createUsers = async (req, res) => {
  const { fullname, username, role, password } = req.body;
  let salt = uuidv1(); // Génération d'un sel unique
  let hached_password = encryptPassword(salt, password); // Chiffrement du mot de passe
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("fullname", getSql().VarChar, fullname)
      .input("username", getSql().VarChar, username)
      .input("Role", getSql().VarChar, role)
      .input("hached_password", getSql().VarChar, hached_password)
      .input("salt", getSql().VarChar, salt)
      .query(Users.create); // Exécution de la requête pour créer un utilisateur

    res.json({
      id: "",
      fullname,
      username,
      role,
      hached_password,
      salt,
    }); // Envoi des informations de l'utilisateur créé au client
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    res.send(error.message); // Envoi de l'erreur au client
  }
};

// Mise à jour des informations d'un utilisateur
exports.updateUsers = async (req, res) => {
  const { hached_password, salt } = req.user;
  const { fullname, username, Role, isActivated } = req.body;
  let newHashedPassword = "";
  if (
    fullname == null ||
    username == null ||
    Role == null ||
    isActivated == null
  ) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("fullname", getSql().VarChar, fullname)
      .input("username", getSql().VarChar, username)
      .input("Role", getSql().VarChar, Role)
      .input("isActivated", getSql().VarChar, isActivated)
      .input("id", getSql().Int, req.params.id)
      .query(Users.update); // Exécution de la requête pour mettre à jour un utilisateur

    res.json({
      id: req.params.id,
      fullname,
      username,
      Role,
      isActivated,
    }); // Envoi des informations mises à jour au client
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    res.send(error.message); // Envoi de l'erreur au client
  }
};

// Récupération des informations d'un utilisateur par son ID
exports.getOneUserById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(Users.getOne); // Exécution de la requête pour récupérer un utilisateur par son ID

    res.set("Content-Range", `ribFournisseur 0-1/1`);

    res.json(result.recordset[0]); // Envoi des informations de l'utilisateur au client
  } catch (error) {
    res.send(error.message); // Envoi de l'erreur au client
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
  }
};

// Middleware pour récupérer un utilisateur par son ID et le stocker dans req.user
exports.getUserOne = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(Users.getOne); // Exécution de la requête pour récupérer un utilisateur par son ID

    req.user = result.recordset[0]; // Stockage de l'utilisateur dans req.user
    next(); // Passage au middleware suivant
  } catch (error) {
    res.send(error.message); // Envoi de l'erreur au client
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
  }
};

/******************************** auth part *********************************/

// Fonction pour récupérer un utilisateur par son nom d'utilisateur
const getUserByUsername = async (username) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("username", getSql().VarChar, username)
      .query(Users.getOneUsename); // Exécution de la requête pour récupérer un utilisateur par son nom d'utilisateur

    return result.recordset;
  } catch (error) {
    res.send(error.message); // Envoi de l'erreur au client
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
  }
};

// Fonction de connexion d'un utilisateur
exports.signin = async (req, res) => {
  const { username, password } = req.body;
  const login = await getUserByUsername(username); // Récupération de l'utilisateur par son nom d'utilisateur

  if (login.length == 0) {
    return res.status(401).json({ message: "username not found" }); // Envoi d'une erreur si l'utilisateur n'est pas trouvé
  }
  if (!authenticate(login[0].salt, password, login[0].hached_password)) {
    return res.status(401).json({ message: "password incorrect" }); // Envoi d'une erreur si le mot de passe est incorrect
  }
  if (login[0].isActivated !== "true") {
    return res.status(401).json({
      error: "your email is disabled, contact your admin",
    }); // Envoi d'une erreur si l'utilisateur n'est pas activé
  }

  // Génération d'un token JWT avec l'ID de l'utilisateur et la clé secrète
  const token = jwt.sign({ id: login[0].salt }, process.env.JWT_SECRET);

  // Persistance du token dans un cookie avec une date d'expiration
  res.cookie("t", token, { expires: new Date(Date.now() + 1000 * 60 * 1440) });

  // Envoi du token et des informations de l'utilisateur au client
  const { id, fullname, Role } = login[0];
  res.json({ token, role: Role, user: { id, fullname, username } });
};

// Fonction de déconnexion d'un utilisateur
exports.signout = (req, res) => {
  res.clearCookie("t"); // Suppression du cookie contenant le token
  return res.json({
    message: "Signout success",
  }); // Envoi d'un message de succès au client
};

// Middleware pour vérifier que l'utilisateur est authentifié
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});
