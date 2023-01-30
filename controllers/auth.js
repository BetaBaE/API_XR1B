const { getConnection, getSql } = require("../database/connection");
const { Users } = require("../database/querys");
const uuidv1 = require("uuid/v1");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const expressJwt = require("express-jwt");

dotenv.config();

exports.getUserCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Users.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

const encryptPassword = (salt, password) => {
  return crypto.createHmac("sha1", salt).update(password).digest("hex");
};

const authenticate = (salt, plainText, hashed_password) => {
  return encryptPassword(salt, plainText) === hashed_password;
};

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

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.createUsers = async (req, res) => {
  const { fullname, username, role, password } = req.body;
  let salt = uuidv1();
  console.log();
  let hached_password = encryptPassword(salt, password);
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("fullname", getSql().VarChar, fullname)
      .input("username", getSql().VarChar, username)
      .input("Role", getSql().VarChar, role)
      .input("hached_password", getSql().VarChar, hached_password)
      .input("salt", getSql().VarChar, salt)
      .query(Users.create);
    // console.log(Users.create);
    console.log("errour");
    res.json({
      id: "",
      fullname,
      username,
      role,
      hached_password,
      salt,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

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
    // if (!hached_password === encryptPassword(salt, password)) {
    //   console.log("if", hached_password === encryptPassword(salt, password));
    //   newHashedPassword = encryptPassword(salt, password);
    // } else {
    //   newHashedPassword = encryptPassword(salt, password);
    //   console.log("else", hached_password === encryptPassword(salt, password));
    // }

    const pool = await getConnection();

    await pool
      .request()
      .input("fullname", getSql().VarChar, fullname)
      .input("username", getSql().VarChar, username)
      .input("Role", getSql().VarChar, Role)
      // .input("hached_password", getSql().VarChar, newHashedPassword)
      .input("isActivated", getSql().VarChar, isActivated)
      .input("id", getSql().Int, req.params.id)
      .query(Users.update);

    res.json({
      id: req.params.id,
      fullname,
      username,
      Role,
      // hached_password: newHashedPassword,
      isActivated,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneUserById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(Users.getOne);

    res.set("Content-Range", `ribFournisseur 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getUserOne = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(Users.getOne);

    // console.log(result.recordset[0]);
    req.user = result.recordset[0];
    next();
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

/******************************** auth part *********************************/

const getUserByUsername = async (username) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("username", getSql().VarChar, username)
      .query(Users.getOneUsename);

    // console.log(result.recordset[0]);
    return result.recordset;
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.signin = async (req, res) => {
  //find the user based on email
  const { username, password } = req.body;
  const login = await getUserByUsername(username);
  console.log(login.length == 0);
  if (login.length == 0) {
    return res.status(401).json({ message: "username not found" });
  }
  if (!authenticate(login[0].salt, password, login[0].hached_password)) {
    return res.status(401).json({ message: "password incorrect" });
  }
  if (login[0].isActivated !== "true") {
    return res.status(401).json({
      error: "your email is desaibled contact ur admin",
    });
  }
  //generte a token with user id and secret key
  const token = jwt.sign({ id: login[0].salt }, process.env.JWT_SECRET);
  //persist the token as 't' in cookie with expiry date
  res.cookie("t", token, { expires: new Date(Date.now() + 1000 * 60 * 1440) });
  // return respons with user and token to frontend client
  const { id, fullname, Role } = login[0];
  res.json({ token, role: Role, user: { id, fullname, username } });

  // return res.json(login);
  // if error or no user
  // User.findOne({ email: username }, (err, user) => {
  //   if (err || !user) {
  //     return res.status(401).json({
  //       error: "User with that email does not exist. Please signup",
  //     });
  //   }
  //   // if user found make sure the email end the password match
  //   if (!user.authenticate(password)) {
  //     return res.status(300).json({
  //       error: "Email and password do not match",
  //     });
  //   }
  //   if (!user.isActivated) {
  //     return res.status(300).json({
  //       error: "your email is desaibled contact ur admin",
  //     });
  //   }
  //   //generte a token with user id and secret key
  //   const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  //   //persist the token as 't' in cookie with expiry date
  //   res.cookie("t", token, { expire: new Date() + 1300 });
  //   // return respons with user and token to frontend cleint
  //   const { _id, email, name, role } = user;
  //   res.json({ token, role, user: { _id, email, name } });
  // });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  return res.json({
    message: "Singout success",
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});
