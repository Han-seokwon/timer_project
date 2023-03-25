const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
require('dotenv').config()

const homeRouter = require("./routes/home");
const authRouter = require("./routes/auth");
const studyRecordRouter = require("./routes/studyRecord");
const statisticRouter = require("./routes/statistic");
const userRouter = require("./routes/user");
const templateRouter = require("./routes/template");
const passport = require("./lib/passport");

const session = require("express-session");
const FileStore = require('session-file-store')(session);
// const MySQLStore = require("express-mysql-session")(session);
const PORT = 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false})); // req.body 사용 가능

// session
app.use(session({
    HttpOnly : true,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store : new FileStore()
}))

passport(app); //passport 실행

app.use("/", homeRouter)
app.use("/auth", authRouter);
app.use("/studyRecord", studyRecordRouter);
app.use("/statistic", statisticRouter);
app.use("/user", userRouter);
app.use("/template", templateRouter);

app.listen(PORT, ()=> {
    console.log("server on!")
})
