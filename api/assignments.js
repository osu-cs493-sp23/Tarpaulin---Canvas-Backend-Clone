const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { Assignment, AssignmentClientFields } = require("../models/assignment");
const { Course, CourseClientFields } = require("../models/course");
const { requireAuthentication } = require("../lib/auth");
const multer = require("multer");
const crypto = require("node:crypto");
const { Submission } = require("../models/submission");
const path = require("path");
const { User } = require("../models/user");

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, `${__dirname}/uploads`);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const fileExtension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    callback(null, filename);
  },
});

const upload = multer({ storage: storage });

// POST Assignments

router.post("/", requireAuthentication, async (req, res, next) => {
  const userId = req.user;
  const admin = req.admin;
  const isInstructor = await User.findOne({
    where: { id: userId, role: "instructor" },
  });

  if (isInstructor || admin) {
    try {
      const courseID = req.body.courseId;
      const course = await Course.findOne({ where: { id: courseID } });
      const newAssignment = await Assignment.create(req.body);
      res.status(201).send({
        id: newAssignment.id,
      });
    } catch (e) {
      next(e);
    }
  } else {
    res.status(403).send({
      err: "Unauthorized to access the specified resource",
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
  const userId = req.user;
  const admin = req.admin;
  const isInstructor = await User.findOne({
    where: { id: userId, role: "instructor" },
  });
  const id = req.params.id;
  const assignment = await Assignment.findByPk(id);
  // console.log(assignment);
  const course = await Course.findByPk(assignment.courseId);
  if (isInstructor || admin) {
    try {
      const result = await Assignment.update(req.body, {
        where: { id: id },
        fields: AssignmentClientFields,
      });
      // console.log(result);
      if (result > 0) {
        res.status(204).send("Updated");
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
      res.status(403).send({ error: "Unauthorized instructor." });
    }
  } catch {
    res.status(401).send({
      error: "Invalid Authentication Token",
    });
  }
});

router.get(
  "/:id/submissions",
  requireAuthentication,
  async (req, res, next) => {
    const userId = req.user;
    const admin = req.admin;
    const isInstructor = await User.findOne({
      where: { id: userId, role: "instructor" },
    });

    if (isInstructor || admin) {
      try {
        const assignmentId = req.params.id;
        const results = await Submission.findAll({
          where: { assignmentId: assignmentId },
        });
        if (results.length == 0) {
          next();
        } else {
          return res.status(200).send(results);
        }
      } catch (e) {
        next(e);
      }
    } else {
      res.status(403).send({
        err: "Unauthorized to access the specified resource",
      });
    }
  }
);

// router.use("assignments/:id/submissions", router.static("uploads/"));

router.post(
  "/:id/submissions",
  requireAuthentication,
  upload.single("pdf"),
  async (req, res, next) => {
    const userId = req.user;
    const isStudent = await User.findOne({
      where: { id: userId, role: "student" },
    });
    console.log(isStudent);
    if (isStudent && req.file && req.body && req.body.userId) {
      try {
        console.log(req.file.path);
        const assignmentId = req.params.id;
        const pdf = {
          assignmentId: parseInt(assignmentId),
          studentId: 1,
          timestamp: req.body.timestamp,
          grade: parseInt(req.body.grades),
          file: req.file.filename,
          userId: 1,
        };
        insertedSubmisson = await Submission.create(pdf);
        res.send({
          message: "File uploaded successfully.",
          // fileUrl: fileUrl,
        });
      } catch (e) {
        next(e);
      }
    } else {
      res.status(403).send({
        err: "Unauthorized to access the specified resource",
      });
    }
  }
);

module.exports = router;
