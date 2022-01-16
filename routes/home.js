// const express = require("express");
// express.Router Еще один вариант обращения

const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Главная страница",
    isHome: true,
  });
});

module.exports = router;
