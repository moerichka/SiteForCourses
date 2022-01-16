const { Router } = require("express");
const auth = require("../middleware/auth");
const Course = require("../models/course");
const router = Router();

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get("/", async (req, res) => {
  try {
    const coursesProto = await Course.find().populate("userId", "email name");
    const courses = [];
    for (const key in coursesProto) {
      const element = coursesProto[key];
      const { ...course } = element._doc;
      const { ...protoUserId } = course.userId._doc;
      course.userId = protoUserId;
      courses.push(course);
    }

    res.render("courses", {
      title: "Курсы",
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
    });
  } catch (error) {
    console.log("error: ", error);
  }
});

router.get(`/:id/edit`, auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  try {
    const courseProto = await Course.findById(req.params.id);

    const { ...course } = courseProto._doc;

    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    res.render("course-edit", {
      title: `Редактировать ${course.title}`,
      course,
    });
  } catch (error) {
    console.log("error: ", error);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    });
    res.redirect("/courses");
  } catch (err) {
    console.log("err: ", err);
  }
});

router.post("/edit", auth, async (req, res) => {
  try {
    const { id } = req.body;
    delete req.body.id;
    const course = await Course.findById(id);

    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    Object.assign(course, req.body);
    await course.save();
    res.redirect("/courses");
  } catch (error) {
    console.log("error: ", error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const courseProto = await Course.findById(req.params.id);
      const { ...course } = courseProto._doc;
      res.render("course", {
        layout: "empty",
        title: `Курс ${course.title}`,
        course,
      });
    } else {
      res.redirect("/courses");
    }
  } catch (error) {
    console.log("error: ", error);
  }
});

module.exports = router;
