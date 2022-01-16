const { Router } = require("express");
const nodemailer = require("nodemailer");
const keys = require("../keys");
const reqEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const router = Router();

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: keys.EMAIL_FROM,
    pass: "B15aWQmGbejh5HWEbbBU",
  },
});

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Авторизация",
    isLogin: true,
    errorRegistration: req.flash("errorRegistration"),
    errorLogin: req.flash("errorLogin"),
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }

          res.redirect("/");
        });
      } else {
        req.flash("errorLogin", "Неверный пароль.");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("errorLogin", "Такого пользователя не существует.");
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    throw error;
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/registration", async (req, res) => {
  try {
    const { email, name, password, repeat } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      req.flash(
        "errorRegistration",
        "Пользователь с таким e-mail уже существует."
      );
      res.redirect("/auth/login#registration");
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        name,
        password: hashPassword,
        cart: { items: [] },
      });
      await user.save();
      res.redirect("/auth/login#login");
      try {
        await transporter.sendMail(reqEmail(email));
      } catch (e) {
        console.log("error: ", e);
      }
    }
  } catch (error) {
    throw error;
  }
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Забыли пароль?",
    error: req.flash("error"),
  });
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Что-то пошло не так повторите попытку позже");
        return res.redirect("/auth/reset");
      }

      const token = buffer.toString("hex");

      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        res.redirect("/auth/login");
        await transporter.sendMail(resetEmail(candidate.email, token));
      } else {
        req.flash("error", "Такого e-mail не существует");
        res.redirect("/auth/reset");
      }
    });
  } catch (error) {
    console.log("error: ", error);
  }
});

router.get("/password/:token", async (req, res) => {
  if (!req.params.token) {
    return res.redirect("auth/login");
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      res.redirect("/auth/login");
    } else {
      res.render("auth/password", {
        title: "Изменение пароля",
        error: req.flash("error"),
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (error) {
    console.log("error: ", error);
  }
});

router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login')
    } else {
      req.flash("errorLogin", "Время жизни токена истекло");
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log("error: ", error);
  }
});

module.exports = router;
