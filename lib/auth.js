const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

