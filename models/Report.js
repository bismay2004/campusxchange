// models/Report.js
// Stores reports submitted by users about inappropriate listings.
// One report per user per listing enforced by compound unique index.

const mongoose = require("mongoose");

const REASONS = [
  "Fake listing",
  "Incorrect information",
  "Spam",
  "Inappropriate content",
  "Other",
];

const reportSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: [true, "Reason is required"],
    enum: REASONS,
  },
  message: { type: String, trim: true, maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
});

// Prevent the same user reporting the same listing multiple times
reportSchema.index({ listing: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);
