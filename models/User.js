// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BRANCHES = ["CSE", "ECE", "ME", "CE", "EE", "IT", "Chemical", "Other"];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [60, "Name too long"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  branch: {
    type: String,
    required: [true, "Branch is required"],
    enum: BRANCHES,
  },
  batch: {
    type: String,
    required: [true, "Batch is required"],
    trim: true,
    // e.g. "2021-2025"
  },
  avatar: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving (only if changed)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method used by Passport during login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
