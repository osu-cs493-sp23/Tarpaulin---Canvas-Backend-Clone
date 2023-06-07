const { Router } = require("express");
const { ValidationError } = require("sequelize");

const router = Router();

router.get("/test", (req, res, next) => {
  res.status(200).send({ test: "test succesful, submissions" });
});

module.exports = router;
