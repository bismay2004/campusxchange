// controllers/listingController.js
const Listing = require("../models/Listing");
const SavedListing = require("../models/SavedListing");
const Inquiry = require("../models/Inquiry");
const Report = require("../models/Report");
const fs = require("fs");
const path = require("path");

const CATEGORIES = ["Books","Electronics","Calculators","Hostel","Cycles","Accessories","Lab Equipment","Notes","Others"];
const CONDITIONS = ["New","Like New","Good","Fair"];
const PAGE_SIZE = 12;

// ─── MARKETPLACE ───────────────────────────────────────────
exports.getMarketplace = async (req, res, next) => {
  try {
    const { search, category, condition, price, sort, page } = req.query;
    const filter = { status: "active" };

    // Text search across title, description, category
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }
    if (category && CATEGORIES.includes(category)) filter.category = category;
    if (condition && CONDITIONS.includes(condition)) filter.condition = condition;

    // Price range filter
    if (price) {
      if (price === "under500") filter.price = { $lt: 500 };
      else if (price === "500to1000") filter.price = { $gte: 500, $lte: 1000 };
      else if (price === "1000to5000") filter.price = { $gte: 1000, $lte: 5000 };
      else if (price === "above5000") filter.price = { $gt: 5000 };
    }

    // Sort options
    let sortObj = { createdAt: -1 }; // default: newest
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };

    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * PAGE_SIZE;
    const total = await Listing.countDocuments(filter);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const listings = await Listing.find(filter)
      .populate("seller", "name branch batch")
      .sort(sortObj)
      .skip(skip)
      .limit(PAGE_SIZE);

    res.render("marketplace", {
      title: "Marketplace",
      listings,
      filters: { search: search || "", category: category || "", condition: condition || "", price: price || "", sort: sort || "" },
      currentPage,
      totalPages,
      total,
      CATEGORIES,
      CONDITIONS,
    });
  } catch (err) {
    next(err);
  }
};

// ─── HOME — recent listings ─────────────────────────────────
exports.getRecentListings = async () => {
  return Listing.find({ status: "active" })
    .populate("seller", "name branch")
    .sort({ createdAt: -1 })
    .limit(8);
};

// ─── CREATE LISTING ─────────────────────────────────────────
exports.getNewListing = (req, res) => {
  res.render("listing-new", { title: "Post a Listing", CATEGORIES, CONDITIONS });
};

exports.postNewListing = async (req, res) => {
  try {
    console.log('postNewListing called. received files:', Array.isArray(req.files) ? req.files.map(f => ({ originalname: f.originalname, fieldname: f.fieldname, filename: f.filename || null, path: f.path || null, secure_url: f.secure_url || null })) : []);
    const { title, description, price, category, condition, branch, batch, location } = req.body;

    if (!title || !description || price === "" || price === undefined || price === null || !category || !condition) {
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/listings/new");
    }
    if (parseFloat(price) < 0) {
      req.flash("error", "Price cannot be negative.");
      return res.redirect("/listings/new");
    }

    const images = req.files ? req.files.map((f) => {
      // multer-storage-cloudinary exposes path/secure_url/url; disk storage uses filename
      if (f.path) return f.path;
      if (f.secure_url) return f.secure_url;
      if (f.url) return f.url;
      if (f.filename) return '/uploads/' + f.filename;
      return '';
    }).filter(Boolean) : [];

    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      images,
      seller: req.user._id,
      branch: branch || req.user.branch,
      batch: batch || req.user.batch,
      location: location ? location.trim() : "",
    });

    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    req.flash("error", "Failed to create listing. Please try again.");
    res.redirect("/listings/new");
  }
};

// ─── SHOW LISTING ───────────────────────────────────────────
exports.showListing = async (req, res, next) => {
  try {
    // Populate seller email so buyers can see it if inquiry is accepted
    const listing = await Listing.findById(req.params.id).populate("seller", "name branch batch createdAt email");
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    let isSaved = false;
    let isOwner = false;
    let myInquiry = null;
    if (req.user) {
      isOwner = listing.seller._id.equals(req.user._id);
      if (!isOwner) {
        const saved = await SavedListing.findOne({ user: req.user._id, listing: listing._id });
        isSaved = !!saved;
        // Check if current user sent an inquiry for this listing
        myInquiry = await Inquiry.findOne({ listing: listing._id, buyer: req.user._id });
      }
    }

    res.render("listing-show", { title: listing.title, listing, isSaved, isOwner, myInquiry });
  } catch (err) {
    next(err);
  }
};

// ─── EDIT LISTING ───────────────────────────────────────────
exports.getEditListing = (req, res) => {
  // req.listing is set by isOwner middleware
  res.render("listing-edit", { title: "Edit Listing", listing: req.listing, CATEGORIES, CONDITIONS });
};

exports.putEditListing = async (req, res) => {
  try {
    console.log('putEditListing called. received files:', Array.isArray(req.files) ? req.files.map(f => ({ originalname: f.originalname, fieldname: f.fieldname, filename: f.filename || null, path: f.path || null, secure_url: f.secure_url || null })) : []);
    const { title, description, price, category, condition, branch, batch, location } = req.body;

    if (!title || !description || price === "" || price === undefined || price === null || !category || !condition) {
      req.flash("error", "Please fill in all required fields.");
      return res.redirect(`/listings/${req.listing._id}/edit`);
    }
    if (parseFloat(price) < 0) {
      req.flash("error", "Price cannot be negative.");
      return res.redirect(`/listings/${req.listing._id}/edit`);
    }

    let images = req.listing.images;
    // If new images uploaded, replace old ones and delete old files
    if (req.files && req.files.length > 0) {
      // Delete old local image files (cloud-hosted images are not stored locally)
      images.forEach((imgPath) => {
        if (imgPath && imgPath.startsWith('/uploads/')) {
          const uploadsPath = path.join(__dirname, "../uploads", path.basename(imgPath));
          if (fs.existsSync(uploadsPath)) fs.unlinkSync(uploadsPath);
        }
      });
      images = req.files.map((f) => {
        if (f.path) return f.path;
        if (f.secure_url) return f.secure_url;
        if (f.url) return f.url;
        return '/uploads/' + f.filename;
      }).filter(Boolean);
    }

    await Listing.findByIdAndUpdate(req.listing._id, {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      images,
      branch: branch || req.listing.branch,
      batch: batch || req.listing.batch,
      location: location ? location.trim() : req.listing.location,
    });

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${req.listing._id}`);
  } catch (err) {
    req.flash("error", "Update failed. Please try again.");
    res.redirect(`/listings/${req.listing._id}/edit`);
  }
};

// ─── DELETE LISTING ─────────────────────────────────────────
exports.deleteListing = async (req, res) => {
  try {
    const listing = req.listing;

    // Delete local image files only (cloud-hosted images are left intact)
    listing.images.forEach((imgPath) => {
      if (imgPath && imgPath.startsWith('/uploads/')) {
        const uploadsPath = path.join(__dirname, "../uploads", path.basename(imgPath));
        if (fs.existsSync(uploadsPath)) fs.unlinkSync(uploadsPath);
      }
    });

    // Clean up related data
    await SavedListing.deleteMany({ listing: listing._id });
    await Inquiry.deleteMany({ listing: listing._id });
    await Report.deleteMany({ listing: listing._id });
    await Listing.findByIdAndDelete(listing._id);

    req.flash("success", "Listing deleted.");
    res.redirect("/dashboard");
  } catch (err) {
    req.flash("error", "Delete failed.");
    res.redirect("/dashboard");
  }
};

// ─── MARK AS SOLD ───────────────────────────────────────────
exports.markSold = async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.listing._id, { status: "sold" });
    req.flash("success", "Listing marked as sold.");
    res.redirect(`/listings/${req.listing._id}`);
  } catch (err) {
    req.flash("error", "Could not mark as sold.");
    res.redirect(`/listings/${req.listing._id}`);
  }
};

// ─── UNMARK (MARK AVAILABLE) ─────────────────────────────────
exports.unmarkSold = async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.listing._id, { status: "active" });
    req.flash("success", "Listing marked as available.");
    res.redirect(`/listings/${req.listing._id}`);
  } catch (err) {
    req.flash("error", "Could not mark as available.");
    res.redirect(`/listings/${req.listing._id}`);
  }
};

// ─── SAVE / UNSAVE ──────────────────────────────────────────
exports.saveListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    if (listing.seller.equals(req.user._id)) {
      req.flash("error", "You cannot save your own listing.");
      return res.redirect(`/listings/${listing._id}`);
    }
    await SavedListing.create({ user: req.user._id, listing: listing._id });
    req.flash("success", "Item saved to your list.");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    if (err.code === 11000) {
      req.flash("error", "Already saved.");
    } else {
      req.flash("error", "Could not save item.");
    }
    res.redirect(`/listings/${req.params.id}`);
  }
};

exports.unsaveListing = async (req, res) => {
  try {
    await SavedListing.findOneAndDelete({ user: req.user._id, listing: req.params.id });
    req.flash("success", "Item removed from saved items.");
    res.redirect(`/listings/${req.params.id}`);
  } catch (err) {
    req.flash("error", "Could not remove saved item.");
    res.redirect(`/listings/${req.params.id}`);
  }
};

// ─── SEND INQUIRY ───────────────────────────────────────────
exports.postInquiry = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    if (listing.status === "sold") {
      req.flash("error", "This item is already sold.");
      return res.redirect(`/listings/${listing._id}`);
    }
    if (listing.seller.equals(req.user._id)) {
      req.flash("error", "You cannot contact yourself.");
      return res.redirect(`/listings/${listing._id}`);
    }
    const { message } = req.body;
    if (!message || !message.trim()) {
      req.flash("error", "Message cannot be empty.");
      return res.redirect(`/listings/${listing._id}`);
    }
    await Inquiry.create({
      listing: listing._id,
      seller: listing.seller,
      buyer: req.user._id,
      message: message.trim(),
    });
    req.flash("success", "Your inquiry has been sent to the seller!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    req.flash("error", "Failed to send inquiry.");
    res.redirect(`/listings/${req.params.id}`);
  }
};

// ─── REPORT ─────────────────────────────────────────────────
exports.postReport = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    const { reason, message } = req.body;
    if (!reason) {
      req.flash("error", "Please select a reason.");
      return res.redirect(`/listings/${listing._id}`);
    }
    await Report.create({
      listing: listing._id,
      reportedBy: req.user._id,
      reason,
      message: message ? message.trim() : "",
    });
    req.flash("success", "Report submitted. We will review it shortly.");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    if (err.code === 11000) {
      req.flash("error", "You have already reported this listing.");
    } else {
      req.flash("error", "Failed to submit report.");
    }
    res.redirect(`/listings/${req.params.id}`);
  }
};
