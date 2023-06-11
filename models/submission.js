const { DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");

const SubmissionSchema = sequelize.define("submission", {
  assignmentId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  timestamp: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING, allowNull: false },
  file: { type: DataTypes.STRING, allowNull: false },
});

exports.SubmissionSchema = SubmissionSchema;
