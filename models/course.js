const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Assignment } = require("./assignment");
const { User } = require("./user");


const Course = sequelize.define("course", {
  subject: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  term: { type: DataTypes.STRING, allowNull: false },
  instructorID: { type: DataTypes.INTEGER, allowNull: false },
});

/*
 * Set up one-to-many relationship between Course and Assignment.
 */
Course.hasMany(Assignment, { foreignKey: { allowNull: false } });
Assignment.belongsTo(Course);

Course.belongsToMany(User, { as: "Students", through: "CourseStudents" });
User.belongsToMany(Course, { as: "Students", through: "CourseStudents" });

exports.Course = Course;

/*
 * Export an array containing the names of fields the client is allowed to set
 * on Courses.
 */
exports.CourseClientFields = [
  "subject",
  "number",
  "title",
  "term",
  "instructorID",
];
