// config/database.js
// Handles MongoDB connection. Called once from app.js.

const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  MongoDB connected");
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1); // Kill the server if DB is unavailable
  }
}

module.exports = connectDB;
