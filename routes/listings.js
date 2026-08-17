const express = require("express");
const router = express.Router();
const listing = require("../controllers/listingController");
const isLoggedIn = require("../middleware/isLoggedIn");
const isOwner = require("../middleware/isOwner");
const upload = require("../middleware/upload");

// Marketplace
router.get("/", listing.getMarketplace);

// Create — order matters: /new must come before /:id
router.get("/new", isLoggedIn, listing.getNewListing);
router.post(
  "/",
  isLoggedIn,
  (req, res, next) => {
    upload.array("images", 4)(req, res, (err) => {
      if (err) { console.error('Upload middleware error (create):', err); req.flash("error", err.message); return res.redirect("/listings/new"); }
      console.log('Upload middleware finished (create). files:', Array.isArray(req.files) ? req.files.length : 0);
      next();
    });
  },
  listing.postNewListing
);

// Show
router.get("/:id", listing.showListing);

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, listing.getEditListing);
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  (req, res, next) => {
    upload.array("images", 4)(req, res, (err) => {
      if (err) { console.error('Upload middleware error (edit):', err); req.flash("error", err.message); return res.redirect(`/listings/${req.params.id}/edit`); }
      console.log('Upload middleware finished (edit). files:', Array.isArray(req.files) ? req.files.length : 0);
      next();
    });
  },
  listing.putEditListing
);

// Delete
router.delete("/:id", isLoggedIn, isOwner, listing.deleteListing);

// Mark sold
router.post("/:id/sold", isLoggedIn, isOwner, listing.markSold);

// Mark available (unmark sold)
router.post("/:id/unsold", isLoggedIn, isOwner, listing.unmarkSold);

// Save / Unsave
router.post("/:id/save", isLoggedIn, listing.saveListing);
router.post("/:id/unsave", isLoggedIn, listing.unsaveListing);

// Inquiry
router.post("/:id/inquiries", isLoggedIn, listing.postInquiry);

// Report
router.post("/:id/report", isLoggedIn, listing.postReport);

module.exports = router;
