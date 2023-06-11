const { DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");

const CourseSchema = sequelize.define("course", {
  subject: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  term: { type: DataTypes.STRING, allowNull: false },
  instructorId: { type: DataTypes.INTEGER, allowNull: false },
});

exports.CourseSchema = CourseSchema;
