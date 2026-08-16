// models/Listing.js
const mongoose = require("mongoose");

const CATEGORIES = [
  "Books", "Electronics", "Calculators", "Hostel",
  "Cycles", "Accessories", "Lab Equipment", "Notes", "Others",
];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be under 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description must be under 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: CATEGORIES,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: CONDITIONS,
    },
    // Array of relative paths to uploaded images, e.g. ["/uploads/abc.jpg"]
    images: { type: [String], default: [] },
    // Reference to the user who created this listing
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branch: { type: String, trim: true },
    batch: { type: String, trim: true },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "sold"],
      default: "active",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Text index for search across title, description, category
listingSchema.index({ title: "text", description: "text", category: "text" });

module.exports = mongoose.model("Listing", listingSchema);
