const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { createNewUser, validateUser, getUserById } = require("../models/user");
const { adminUser, generateAuthToken, requireAuthentication } = require("../lib/auth");

const router = Router();

router.get("/test", (req, res, next) => {
  return res.status(200).send({ test: "test succesful, user" });
});

/*
 * Route to create a new user.
 */
router.post("/", adminUser, async function (req, res, next) {
  if (req.admin == false && req.body.admin == true) {
    return res.status(403).send("Forbidden Access");
  } else {
    try {
      const { name, email, password, role, admin } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).send({ error: "Missing required fields" });
      }
      // Create a new user
      const newUser = await createNewUser(name, email, password,role, admin);
      if (newUser.error) {
        return res.status(400).send({ error: newUser.error });
      }
      res.status(201).send({
        id: newUser.id,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        admin: newUser.admin
      });
    } catch (e) {
      if (e instanceof ValidationError) {
        return res.status(400).send({ error: e.message });
      } else {
        next(e);
      }
    }
  }
});

/*
 * Route to Login for Users.
 */
router.post("/login", async function (req, res, next) {
  if (req.body && req.body.id && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(
        req.body.id,
        req.body.email,
        req.body.password
      );
      if (authenticated) {
        const token = await generateAuthToken(req.body.id);
        res.status(200).send({
          token: token,
        });
      } else {
        res.status(401).send({
          error: "Invalid Authentication Credentials!",
        });
      }
    } catch (e) {
      next(e);
    }
  } else {
    res.status(400).send({
      error: "Request Body Requires Email and Password.",
    });
  }
});

/*
 * Route to Get a user.
 */
router.get("/:id", requireAuthentication, async function (req, res, next) {
  const admin = req.admin;
  if (req.user == req.params.id || admin) {
    try {
      const id = req.params.id;
      const user = await getUserById(id);
      if (user) {
        res.status(200).send(user);
      }
    } catch (e) {
      next(e);
    }
  } else {
    res.status(403).send({
      error: "Unauthorized To Access the specified resource",
    });
  }
});

module.exports = router;
