// middleware/isOwner.js
// Verifies that the logged-in user owns the listing they are trying to modify.
// Must be used AFTER isLoggedIn (req.user is guaranteed to exist).
//
// INTERVIEW EXPLANATION:
// We never trust the client for ownership checks. Even if someone crafts
// a direct HTTP request, this middleware checks the DB record server-side.

const Listing = require("../models/Listing");

module.exports = async function isOwner(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    // Compare listing's seller ObjectId with logged-in user's _id
    if (!listing.seller.equals(req.user._id)) {
      req.flash("error", "You are not authorized to do that.");
      return res.redirect(`/listings/${listing._id}`);
    }
    // Attach listing to req so the controller doesn't need to fetch it again
    req.listing = listing;
    next();
  } catch (err) {
    next(err);
  }
};
