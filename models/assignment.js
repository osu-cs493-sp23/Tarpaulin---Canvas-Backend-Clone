const { DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");

const AssignmentSchema = sequelize.define("assignment", {
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false },
  due: { type: DataTypes.STRING, allowNull: false },
});

exports.AssignmentSchema = AssignmentSchema;
