const { Router } = require("express");
const Order = require("../models/order");
const auth = require('../middleware/auth');

const router = new Router();

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      "user.userId": req.user._id,
    })
      .populate("user.userId")
      .lean();

    res.render("orders", {
      isOrder: true,
      title: "Заказы",
      orders: orders.map((o) => {
        return {
          ...o._doc,
          _id: o._id,
          user: o.user,
          email: o.user.userId.email,
          date: o.date,
          courses2: o.courses.map((e) => {
            return e;
          }),
          price: o.courses.reduce((total, c) => {
            return (total += c.count * c.course.price);
          }, 0),
        };
      }),
    });
  } catch (e) {
    console.log("e: ", e);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("card.items.courseId");

    const courses = user.card.items.map((i) => ({
      count: i.count,
      course: { ...i.courseId._doc },
    }));

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    });

    await order.save();
    await req.user.clearCard();

    res.redirect("/orders");
  } catch (e) {
    console.log("e: ", e);
  }
});

module.exports = router;
