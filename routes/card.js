const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = new Router();

function mapCardItems(card) {
  return card.items.map((c) => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count,
  }));
}

function computePrice(courses) {
  return courses.reduce((total, course) => {
    return (total += course.price * course.count);
  }, 0);
}

router.post("/add", auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCard(course);
  res.redirect("/card");
});

router.delete("/remove/:id", auth, async (req, res) => {
  await req.user.removeFromCard(req.params.id);
  const user = await req.user.populate("card.items.courseId");
  const courses = mapCardItems(user.card);
  const card = {
    courses,
    price: computePrice(courses),
  };

  res.status(200).json(card);
});

router.get("/", auth, async (req, res) => {
  const user = await req.user.populate("card.items.courseId");
  const courses = mapCardItems(user.card);

  res.render("card", {
    title: "Корзина",
    isCard: true,
    courses: courses,
    price: computePrice(courses),
  });
});

module.exports = router;
