const { Router } = require("express");
const auth = require("../middleware/auth");
const Course = require("../models/course");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const coursesProto = await Course.find().populate("userId", "email name");
    const courses = [];
    for (const key in coursesProto) {
      const element = coursesProto[key];
      const {...course} = element._doc; 
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
  const courseProto = await Course.findById(req.params.id);

  const {...course} = courseProto._doc; 

  res.render("course-edit", {
    title: `Редактировать ${course.title}`,
    course,
  });
});

router.post("/remove", auth, async (req, res) => {
  const { id } = req.body;
  try {
    await Course.deleteOne({ _id: id });
    res.redirect("/courses");
  } catch (err) {
    console.log("err: ", err);
  }
});

router.post("/edit", auth, async (req, res) => {
  const { id } = req.body;
  delete req.body.id;
  await Course.findByIdAndUpdate(id, req.body);
  res.redirect("/courses");
});

router.get("/:id", async (req, res) => {

  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    const courseProto = await Course.findById(req.params.id);
    const {...course} = courseProto._doc; 
    res.render("course", {
      layout: "empty",
      title: `Курс ${course.title}`,
      course,
    });
  }
  else{
    res.redirect('/courses');
  }
});

module.exports = router;
