// config/passport.js
// Configures Passport Local Strategy for email/password login.
//
// HOW IT WORKS:
// 1. User POSTs email + password to /login
// 2. LocalStrategy finds user by email, compares bcrypt hash
// 3. On success: serializeUser stores user._id in the session
// 4. On every request: deserializeUser reads the ID from session
//    and fetches the full user from MongoDB → attaches to req.user

const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

module.exports = function (passport) {
  // Use "email" field instead of default "username"
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
          return done(null, false, { message: "No account found with that email." });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Store only the user ID in the session cookie
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // On every request, fetch full user from DB using the stored ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select("-password");
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
