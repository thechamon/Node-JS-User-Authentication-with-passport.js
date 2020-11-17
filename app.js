const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
// We always have some problem here because of auto IDE suggestion, Keep caution.
const passport = require("passport");

const app = express();

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").MongoURI;

// Connect to Mongo
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

mongoose
  .connect(db)
  .then(() => console.log("Database(MongoDB) connected with app..."))
  .catch(() => console.log(err));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express session middleware @https://github.com/expressjs/session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
// Reference: @http://www.passportjs.org/docs/downloads/html/ @Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash @Flash middleware
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`http://localhost:${PORT}`));
