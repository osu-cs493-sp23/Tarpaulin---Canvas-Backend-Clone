const { Router } = require("express");
const { ValidationError } = require("sequelize");
const { Course, CourseClientFields } = require("../models/course");
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

router.post("/", async (req, res, next) => {
  const course = await Course.create(req.body);
  res.status(201).send({ id: course.id });
});

//GET A SPECIFIC COURSE

router.get("/:id", async (req, res, next) => {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);
  if (course) {
    res.status(200).send(course);
  } else {
    next();
  }
});

//PATCH A SPECIFIC COURSE

router.patch("/:id", async (req, res, next) => {
  const courseId = req.params.id;
  const result = await Course.update(req.body, {
    where: { id: courseId },
    fields: CourseClientFields,
  });

  if (result[0] > 0) {
    res.status(204).send();
  }
  // else {
  //   res.status(201).send("update");
  // }
});

router.delete("/:id", async (req, res, next) => {
  const courseId = req.params.id;
  const result = await Course.destroy({ where: { id: courseId } });
  if (result > 0) {
    res.status(204).send();
  }
});

router.get("/:id/students", async (req, res, next) => {
  const courseId = req.params.id;
});

module.exports = router;
