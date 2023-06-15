const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { Assignment, AssignmentClientFields } = require("../models/assignment");
const { Course, CourseClientFields } = require("../models/course");
const { instructorVerification } = require("../lib/auth");

const router = Router();

router.get("/test", (req, res, next) => {
  res.status(200).send({ test: "test succesful , assignments" });
});

// POST Assignments

router.post("/", async (req, res, next) => {
  try {
    const newAssignment = await Assignment.create(req.body);
    res.status(201).send({
      id: newAssignment.id,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).send({
        err: err.message,
      });
    } else {
      next(err);
    }
  }
});

// post assignment submission with ID

router.post("/:id", async (req, res, next) => {
  try{
    const newAssignment = await Assignment.create(req.body)
    res.status(201).send({
      id: newAssignment.id
    })
  } catch (err) {
    if(err instanceof ValidationError) {
      res.status(400).send({
        err: err.message
      })
    } else {
      next(err)
    }
  }
})

// Get assignment with id
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const assignment = await Assignment.findByPk(id);
  if (assignment) {
    res.status(200).send(assignment);
  } else {
    next();
  }
});

// modify assignment

router.patch("/:id", instructorAuthorization, async (req, res, next) => {
  const course = await Course.findByPk(req.body.courseId);
  if (req.user == course.instructorId || req.admin) {
    try {
      const result = await Assignment.update(req.body, {
        where: { id: id },
        fields: AssignmentClientFields,
      });
      if (result[0] > 0) {
        res.status(204).send();
      } else {
        next();
      }
    } catch (e) {
      next(e);
    }
  } else {
    res.status(403).send({
      err: "Unauthorized to access the specified resource",
    });
  }
});

router.delete("/:id", instructorVerification, async (req, res, next) => {
  const course = await Course.findByPk(req.body.courseId);
  if (req.user == course.instructorId || req.admin) {
    try {
      const result = await Assignment.destroy({ where: { id: id } });
      if (result > 0) {
        res.status(204).send();
      } else {
        next();
      }
    } catch (e) {
      next(e);
    }
  } else {
    res.status(403).send({
      err: "Unauthorized to Delete the specified resource",
    });
  }
});

module.exports = router;
