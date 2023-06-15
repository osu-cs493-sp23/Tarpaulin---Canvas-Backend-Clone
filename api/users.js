const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { createNewUser } = require("../models/user");

const router = Router();

router.get("/test", (req, res, next) => {
  return res.status(200).send({ test: "test succesful, user" });
});

/*
 * Route to create a new user.
 */
router.post("/", async function (req, res, next) {
  console.log("Hollooooooo");
  // if (req.admin == false && req.body.admin == true) {
  //   return res.status(403).send("Forbidden Access");
  // } else {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).send({ error: "Missing required fields" });
    }
    // Create a new user
    const newUser = await createNewUser(name, email, password, role);
    if (newUser.error) {
      return res.status(400).send({ error: newUser.error });
    }
    res.status(201).send({
      id: newUser.id,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(400).send({ error: e.message });
    } else {
      next(e);
    }
  }
  // }
});

module.exports = router;
