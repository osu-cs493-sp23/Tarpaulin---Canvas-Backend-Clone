const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Submission } = require("./submission");
const bcrpyt = require("bcryptjs");
const User = sequelize.define("user", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: false },
});

User.hasMany(Submission, { foreignKey: { allowNull: false } });
Submission.belongsTo(User);

exports.User = User;

/*
 * Export an array containing the names of fields the client is allowed to set
 * on users.
 */
exports.UserClientFields = ["name", "email", "password", "role"];
