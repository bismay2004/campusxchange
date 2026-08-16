// controllers/userController.js
// Handles dashboard, profile, and saved items pages.

const Listing = require("../models/Listing");
const SavedListing = require("../models/SavedListing");
const Inquiry = require("../models/Inquiry");

// GET /dashboard — user's personal dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run all three queries in parallel for efficiency
    const [myListings, savedCount, unreadCount] = await Promise.all([
      Listing.find({ seller: userId }).sort({ createdAt: -1 }),
      SavedListing.countDocuments({ user: userId }),
      Inquiry.countDocuments({ seller: userId, status: "unread" }),
    ]);

    const activeCount = myListings.filter((l) => l.status === "active").length;
    const soldCount   = myListings.filter((l) => l.status === "sold").length;

    res.render("dashboard", {
      title: "My Dashboard",
      myListings,
      stats: { activeCount, soldCount, savedCount, unreadCount },
    });
  } catch (err) {
    next(err);
  }
};

// GET /profile — view profile details
exports.getProfile = (req, res) => {
  res.render("profile", { title: "My Profile" });
};

// GET /saved — saved/wishlist items
exports.getSaved = async (req, res, next) => {
  try {
    const saved = await SavedListing.find({ user: req.user._id })
      .populate({
        path: "listing",
        populate: { path: "seller", select: "name branch" },
      })
      .sort({ createdAt: -1 });

    // Filter out records where the listing was deleted from MongoDB
    const validSaved = saved.filter((s) => s.listing !== null);

    res.render("saved", { title: "Saved Items", saved: validSaved });
  } catch (err) {
    next(err);
  }
};
