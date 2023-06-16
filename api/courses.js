const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { Course, CourseClientFields } = require("../models/course");
const { User } = require("../models/user");
const { requireAuthentication } = require("../lib/auth");
const router = Router();

router.get("/test", (req, res, next) => {
  res.status(200).send({ test: "test succesful, courses" });
});

//GET ALL COURSES

router.get("/", async (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  page = page < 1 ? 1 : page;
  const numPerPage = 10;
  const offset = (page - 1) * numPerPage;

  try {
    const result = await Course.findAndCountAll({
      limit: numPerPage,
      offset: offset,
    });

    /*
     * Generate HATEOAS links for surrounding pages.
     */
    const lastPage = Math.ceil(result.count / numPerPage);
    const links = {};
    if (page < lastPage) {
      links.nextPage = `/courses?page=${page + 1}`;
      links.lastPage = `/courses?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/courses?page=${page - 1}`;
      links.firstPage = "/courses?page=1";
    }

    /*
     * Construct and send response.
     */
    res.status(200).json({
      courses: result.rows,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: result.count,
      links: links,
    });
  } catch (e) {
    next(e);
  }
});

//POST A COURSE
router.post("/", requireAuthentication, async (req, res, next) => {
  const admin = await req.admin;
  if (admin) {
    try {
      const { subject, number, title, term, instructorID } = req.body;
      if (!subject || !number || !title || !term || !instructorID) {
        return res.status(400).send({ error: "Missing required fields" });
      }
      const course = await Course.create(req.body);
      res.status(201).send({ id: course.id });
    } catch (e) {
      next(e);
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to create a course.",
    });
  }
});

//GET A SPECIFIC COURSE
router.get("/:id", async (req, res, next) => {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);
  if (course) {
    res.status(200).send(course);
  } else {
    return res.status(404).send({
      error: "Requested resource does not exist.",
    });
  }
});

//PATCH A SPECIFIC COURSE
router.patch("/:id", requireAuthentication, async (req, res, next) => {
  const instructorID = req.body.instructorID;
  const admin = await req.admin;
  console.log(admin);
  if (req.user == instructorID || admin) {
    try {
      const user = await User.findOne({
        where: { id: instructorID, role: "instructor" },
      });
      if (!user) {
        return res.status(404).send({ error: "Instructor not found" });
      }
      const courseId = req.params.id;
      const result = await Course.update(req.body, {
        where: { id: courseId, instructorID: instructorID },
        fields: CourseClientFields,
      });
      if (result[0] > 0) {
        res.status(200).send({
          message: "Updated the course.",
        });
      } else {
        return res.status(404).send({
          error: "Invalid Instructor.",
        });
      }
    } catch (e) {
      next(e);
    }
  } else {
    return res.status(403).send({
      error: "Unauthorized To Access the specified resource",
    });
  }
});

// Only Authenticated user with admin can delete.
router.delete("/:id", async (req, res, next) => {
  const admin = await req.admin;
  if (admin) {
    const courseId = req.params.id;
    const result = await Course.destroy({ where: { id: courseId } });
    if (result > 0) {
      res.status(204).send();
    } else {
      res.status(404).send({ msg: "ID doesn't exist." });
    }
  } else {
    res.status(403).send({ msg: "UnAuthorized access." });
  }
});

router.get("/:id/students", async (req, res, next) => {
  const courseId = req.params.id;
});

module.exports = router;
