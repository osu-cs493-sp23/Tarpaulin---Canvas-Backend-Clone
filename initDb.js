/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.
 */
require("dotenv").config();
const sequelize = require("./lib/sequelize");
const { Course } = require("./models/course");
const courseData = require("./testdata/courses.json");

sequelize.sync().then(async function () {
  await Course.bulkCreate(courseData);
});
