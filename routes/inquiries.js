// routes/inquiries.js — Inquiry routes
const express = require("express");
const router = express.Router();
const inquiry = require("../controllers/inquiryController");
const isLoggedIn = require("../middleware/isLoggedIn");

// GET /inquiries — seller sees all received inquiries
router.get("/", isLoggedIn, inquiry.getInquiries);

// POST /inquiries/:id/read — mark one inquiry as read
router.post("/:id/read", isLoggedIn, inquiry.markInquiryRead);

// POST /inquiries/:id/accept — seller accepts an inquiry
router.post("/:id/accept", isLoggedIn, inquiry.acceptInquiry);

// POST /inquiries/:id/reject — seller rejects an inquiry
router.post("/:id/reject", isLoggedIn, inquiry.rejectInquiry);

// GET /inquiries/sent — buyer sees their sent inquiries
router.get("/sent", isLoggedIn, inquiry.getMyInquiries);

module.exports = router;
