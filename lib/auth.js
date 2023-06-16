const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

const generateAuthToken = async function generateAuthToken(userId) {
    const user = await User.findByPk(userId, {
      attributes: ["admin"],
    });
    const checkAdmin = user.dataValues.admin;
    const payload = { sub: userId, checkAdmin: checkAdmin };
    return jwt.sign(payload, secretKey, { expiresIn: "24h" });
  };
  exports.generateAuthToken = generateAuthToken;
  
  const requireAuthentication = function requireAuthentication(req, res, next) {
    const authHeader = req.get("Authorization") || "";
    const authHeaderParts = authHeader.split(" ");
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;
    try {
      const payload = jwt.verify(token, secretKey);
      req.user = payload.sub;
      req.admin = payload.checkAdmin;
      next();
    } catch (err) {
      console.log("==Error Verifying Token: ", err);
      res.status(401).send({
        error: "Invalid Authentication Token",
      });
    }
  };
  exports.requireAuthentication = requireAuthentication;
  
  const adminUser = function adminUser(req, res, next) {
    const authHeader = req.get("Authorization") || "";
    const authHeaderParts = authHeader.split(" ");
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;
    console.log(token);
    if (token == null || req.admin == false) {
      req.admin = false;
      next();
    } else {
      try {
        const payload = jwt.verify(token, secretKey);
        req.user = payload.sub;
        req.admin = payload.checkAdmin;
        next();
      } catch (err) {
        console.log("==Error Verifying Token: ", err);
        res.status(401).send({
          error: "Invalid Authentication Token",
        });
      }
    }
  };
  exports.adminUser = adminUser;