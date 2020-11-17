const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// User model
const User = require("../models/User");
const { Passport } = require("passport");
const { route } = require(".");
// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Ckeck require fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all required field." });
  }

  // Check password match
  if (password !== password2) {
    errors.push({ msg: " Password do not match." });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: " Password should contain at least 6 characters." });
  }

  // Now....

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User Exist
        errors.push({ msg: " Email is alraedy registered." });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        // Hash the password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // save User
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can login"
                );
                res.redirect("/users/login");
              })
              .catch(console.log(err));
          })
        );
      }
    });
  }
});

// Login handler
router.post("/login", (req, res, next) => {
  //Authenticating user for log in using passport
  // Reference: @http://www.passportjs.org/docs/downloads/html/ @Custom Callback
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout handler
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You are logged out.");
  res.redirect("/users/login");
});

module.exports = router;
