const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const bcrpyt = require("bcryptjs");
const User = sequelize.define("user", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});



exports.User = User;
