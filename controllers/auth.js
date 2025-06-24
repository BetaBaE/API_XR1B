const { getConnection, getSql } = require("../database/connection");
const { Users } = require("../database/UserQuery");
const uuidv1 = require("uuid/v1");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const expressJwt = require("express-jwt");

dotenv.config();

// Utility functions
const encryptPassword = (salt, password) => {
  return crypto.createHmac("sha1", salt).update(password).digest("hex");
};

const authenticate = (salt, plainText, hashed_password) => {
  return encryptPassword(salt, plainText) === hashed_password;
};

const getUserByUsername = async (username) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("username", getSql().VarChar, username)
    .query(Users.getOneUsename);
  return result.recordset;
};

// Middlewares
exports.getUserCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Users.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserOne = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(Users.getOne);
    req.user = result.recordset[0];
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

// User CRUD operations
exports.getUsers = async (req, res) => {
  try {
    let { range = "[0,9]", sort = '["id", "ASC"]', filter = "{}" } = req.query;
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.fullname)
      queryFilter += ` and fullname like('%${filter.fullname}%')`;
    if (filter.username)
      queryFilter += ` and username like('%${filter.username}%')`;
    if (filter.Role) queryFilter += ` and Role like('%${filter.Role}%')`;
    if (filter.isActivated)
      queryFilter += ` and isActivated = '${filter.isActivated}'`;

    const pool = await getConnection();
    const result = await pool.request().query(
      `${Users.getAll} ${queryFilter} 
       ORDER BY ${sort[0]} ${sort[1]}
       OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set("Content-Range", `users ${range[0]}-${range[1]}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUsers = async (req, res) => {
  try {
    const { fullname, username, role, password } = req.body;
    if (!fullname || !username || !role || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const salt = uuidv1();
    const hached_password = encryptPassword(salt, password);

    const pool = await getConnection();
    await pool
      .request()
      .input("fullname", getSql().VarChar, fullname)
      .input("username", getSql().VarChar, username)
      .input("Role", getSql().VarChar, role)
      .input("hached_password", getSql().VarChar, hached_password)
      .input("salt", getSql().VarChar, salt)
      .query(Users.create);

    res.status(201).json({ id: "", fullname, username, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUsers = async (req, res) => {
  try {
    const { fullname, username, Role, isActivated } = req.body;
    if (!fullname || !username || !Role || isActivated === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("fullname", getSql().VarChar, fullname)
      .input("username", getSql().VarChar, username)
      .input("Role", getSql().VarChar, Role)
      .input("isActivated", getSql().VarChar, isActivated)
      .input("id", getSql().Int, req.params.id)
      .query(Users.update);

    res.json({ id: req.params.id, fullname, username, Role, isActivated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required" });
    }

    // Get user ID from the JWT token (req.auth.id) instead of req.params.id
    const userId = req.auth.id;

    // Fetch the user from DB using userId
    const pool = await getConnection();
    const userResult = await pool
      .request()
      .input("id", getSql().Int, userId)
      .query(Users.getOne);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.recordset[0];

    // Verify current password
    if (!authenticate(user.salt, currentPassword, user.hached_password)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Generate new salt and hash
    const newSalt = uuidv1();
    const newHashedPassword = encryptPassword(newSalt, newPassword);

    // Update password in DB
    await pool
      .request()
      .input("hached_password", getSql().VarChar, newHashedPassword)
      .input("salt", getSql().VarChar, newSalt)
      .input("id", getSql().Int, userId)
      .query(
        `UPDATE [dbo].[DAF_USER] 
         SET hached_password = @hached_password, salt = @salt 
         WHERE id = @id`
      );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOneUserById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(Users.getOne);

    res.set("Content-Range", "users 0-1/1");
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auth operations
exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const login = await getUserByUsername(username);
    if (login.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = login[0];
    if (!authenticate(user.salt, password, user.hached_password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.isActivated !== "true") {
      return res.status(403).json({ error: "Account disabled, contact admin" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // Set secure cookie with HttpOnly and SameSite attributes
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      // maxAge: 1 * 60 * 1000, // 1 minute for testing, change to 4 hours in production
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
      path: "/",
    });

    // Return minimal user data (token is in cookie)
    res.json({
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        role: user.Role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update signout function
exports.signout = (req, res) => {
  // res.clearCookie("authToken", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   path: "/",
  // });
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined, // Add if using cross-subdomain
  });

  res.json({ message: "Signed out successfully" });
};

// Update requireSignin middleware to check cookie
exports.requireSignin = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.auth = decoded;
    next();
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullname } = req.body;
    const userId = req.auth.id;

    if (!fullname) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("fullname", getSql().VarChar, fullname)
      .input("id", getSql().Int, userId)
      .query(
        `UPDATE [dbo].[DAF_USER] 
         SET fullname = @fullname 
         WHERE id = @id`
      );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.auth.role !== "admin") {
      return res.status(403).json({ error: "Only admins can reset passwords" });
    }

    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res
        .status(400)
        .json({ error: "User ID and new password are required" });
    }

    // Generate new salt and hash
    const newSalt = uuidv1();
    const newHashedPassword = encryptPassword(newSalt, newPassword);

    const pool = await getConnection();
    await pool
      .request()
      .input("hached_password", getSql().VarChar, newHashedPassword)
      .input("salt", getSql().VarChar, newSalt)
      .input("id", getSql().Int, userId)
      .query(Users.resetPassword);

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    // Generate new salt and hash
    const salt = uuidv1();
    const hached_password = encryptPassword(salt, newPassword);

    const pool = await getConnection();
    await pool
      .request()
      .input("hached_password", getSql().VarChar, hached_password)
      .input("salt", getSql().VarChar, salt)
      .input("id", getSql().Int, id)
      .query(Users.resetPassword);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
