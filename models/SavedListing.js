// models/SavedListing.js
// Tracks which listings a user has saved (wishlist).
// The compound unique index prevents a user from saving the same listing twice.

const mongoose = require("mongoose");

const savedListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Unique constraint: one save record per user per listing
savedListingSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model("SavedListing", savedListingSchema);
