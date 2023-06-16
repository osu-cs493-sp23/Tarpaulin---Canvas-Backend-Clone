const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { Assignment, AssignmentClientFields } = require("../models/assignment");
const { Course, CourseClientFields } = require("../models/course");
const { requireAuthentication } = require("../lib/auth");
const multer = require("multer");
const crypto = require("node:crypto");
const { Submission } = require("../models/submission");

const router = Router();

const imageTypes = {
  pdf: "pdf",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const filename = crypto.pseudoRandomBytes(16).toString("hex");
      console.log(file);
      const extension = imageTypes[file.mimetype];
      callback(null, `${filename}.${extension}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!imageTypes[file.mimetype]);
  },
});

// POST Assignments

router.post("/", requireAuthentication, async (req, res, next) => {
  try {
    const courseID = req.body.courseId;
    const course = await Course.findOne({ where: { id: courseID } });
    console.log(course);
    if (req.user == course.instructorID || req.admin) {
      const newAssignment = await Assignment.create(req.body);
      res.status(201).send({
        id: newAssignment.id,
      });
    } else {
      res.status(400).send({ error: "Unauthorized instructor." });
    }
  } catch (err) {
    res.status(401).send({
      error: "Invalid Authentication Token",
    });
  }
});

// Get assignment with id
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const assignment = await Assignment.findByPk(id);
  if (assignment) {
    res.status(200).send(assignment);
  } else {
    res.status(404).send({
      error: "Assignment doesn't exist",
    });
  }
});

// modify assignment

router.patch("/:id", requireAuthentication, async (req, res, next) => {
  try {
    const id = req.params.id;
    const assignment = await Assignment.findByPk(id);
    // console.log(assignment);
    const course = await Course.findByPk(assignment.courseId);
    // console.log(course);
    if (req.user == course.instructorID || req.admin) {
      const result = await Assignment.update(req.body, {
        where: { id: id },
        fields: AssignmentClientFields,
      });
      // console.log(result);
      if (result > 0) {
        res.status(204).send(result);
      } else {
        next();
      }
    } else {
      res.status(403).send({
        err: "Unauthorized to access the specified resource",
      });
    }
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuthentication, async (req, res, next) => {
  try {
    const id = req.params.id;
    const assignment = await Assignment.findByPk(id);
    console.log(assignment);
    const course = await Course.findByPk(assignment.courseId);
    if (req.user == course.instructorID || req.admin) {
      const result = await Assignment.destroy({ where: { id: req.params.id } });
      console.log("In here");
      if (result > 0) {
        res.status(204).send();
      } else {
        next();
      }
    } else {
      res.status(400).send({ error: "Unauthorized instructor." });
    }
  } catch {
    res.status(401).send({
      error: "Invalid Authentication Token",
    });
  }
});

router.post(
  "/:id/submissions",
  upload.single("pdf"),
  async function (req, res, next) {
    console.log("  -- req.file:", req.file);
    console.log("  -- req.body:", req.body);
    if (req.file && req.body && req.body.userId) {
      // const pdf = {
      //   assignmentId: req.params.id,
      //   studentId: req.body,
      //   timestamp: req.file.filename,
      //   path: req.file.path,
      //   userId: req.body.userId,
      // };
      //  const inserted = Submission.create(pdf);
      res.status(200).send();
    } else {
      res.status(400).send({
        err: "Invalid file",
      });
    }
  }
);

module.exports = router;
