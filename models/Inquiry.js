// models/Inquiry.js
// Stores messages sent from a buyer to a seller about a listing.
// No real-time chat — just a stored message system.

const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    maxlength: [500, "Message must be under 500 characters"],
  },
  // 'status' tracks read/unread; 'response' tracks seller action
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread",
  },
  response: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inquiry", inquirySchema);
