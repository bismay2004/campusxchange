// controllers/authController.js
const passport = require("passport");
const User = require("../models/User");

exports.getSignup = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/dashboard");
  res.render("signup", { title: "Create Account" });
};

exports.postSignup = async (req, res) => {
  const { name, email, password, confirmPassword, branch, batch } = req.body;

  if (!name || !email || !password || !branch || !batch) {
    req.flash("error", "All fields are required.");
    return res.redirect("/signup");
  }
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/signup");
  }
  if (password.length < 6) {
    req.flash("error", "Password must be at least 6 characters.");
    return res.redirect("/signup");
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/signup");
    }
    const user = await User.create({ name, email, password, branch, batch });
    req.login(user, (err) => {
      if (err) { req.flash("error", "Login after signup failed."); return res.redirect("/login"); }
      req.flash("success", `Welcome to CampusXchange, ${user.name.split(" ")[0]}!`);
      res.redirect("/dashboard");
    });
  } catch (err) {
    if (err.code === 11000) {
      req.flash("error", "Email already registered.");
      return res.redirect("/signup");
    }
    req.flash("error", "Signup failed. Please try again.");
    res.redirect("/signup");
  }
};

exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/dashboard");
  res.render("login", { title: "Login" });
};

exports.postLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", info.message || "Login failed.");
      return res.redirect("/login");
    }
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome back, ${user.name.split(" ")[0]}!`);
      res.redirect("/dashboard");
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out.");
    res.redirect("/");
  });
};
