// routes/reports.js — Report routes
// Reports are submitted via listing detail page: POST /listings/:id/report
// This file is kept as a placeholder per spec; the actual POST handler
// is on the listings router since it needs the listing :id param.
// If admin report-viewing is added later, those routes go here.

const express = require("express");
const router = express.Router();

// No public routes currently — report POST lives in routes/listings.js
// Future: GET /reports (admin view) would go here

module.exports = router;
