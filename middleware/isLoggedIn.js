// middleware/isLoggedIn.js
// Protects routes that require authentication.
// If user is not logged in, save the attempted URL and redirect to login.

module.exports = function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash("error", "Please log in to continue.");
  res.redirect("/login");
};
