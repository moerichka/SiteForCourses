// --Modules--
const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const keys = require('./keys')
// --/Modules--

// --Routes--
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const cardRoutes = require("./routes/card");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
// --/Routes--

// --Middlewares--
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user.js");
// --/Middlewares--

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require('./utils/hbs-helpers')
}); //настройка handlebare

const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

app.engine("hbs", hbs.engine); // обЬявляем что есть такой движок
app.set("view engine", "hbs"); // принимаем его дефолтным для обработки с форматом hbs
app.set("views", "views"); // папку в которой будут данные файлы

app.use(express.static(path.join(__dirname, "public"))); //делаем папку паблик со стилями статической
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, { useNewUrlParser: true });
  } catch (err) {
    console.log(err);
  }
}
start();

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

// app.get("/", (req, res, next) => {
// res.sendFile(path.join(__dirname, "views", "index.html")); // больше не понадобится так как есть рендеринг с помощь
// handlera
// });

// app.use(async (req, res, next) => {
//   try {
//     const user = await User.findById("6181369a89ebd9f3d6f8355c");
//     req.user = user;

//     next();
//   } catch (err) {
//     console.log("err: ", err);
//   }
// });

// const candidate = await User.findOne();
// if (!candidate) {
//   const user = new User({
//     email: "mi@m.f",
//     name: "Misha",
//     card: { items: [] },
//   });
//   await user.save();
// }
