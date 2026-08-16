// routes/users.js — User dashboard, profile, saved items routes
const express = require("express");
const router = express.Router();
const user = require("../controllers/userController");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/dashboard", isLoggedIn, user.getDashboard);
router.get("/profile", isLoggedIn, user.getProfile);
router.get("/saved", isLoggedIn, user.getSaved);

module.exports = router;
