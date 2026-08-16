// controllers/inquiryController.js
// Handles all inquiry actions: send, view received, mark read.

const Inquiry = require("../models/Inquiry");
const Listing = require("../models/Listing");
const { formatDate } = require("../utils/helpers");

// POST /listings/:id/inquiries — buyer sends message to seller
exports.postInquiry = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    if (listing.status === "sold") {
      req.flash("error", "This item is already sold. You cannot send an inquiry.");
      return res.redirect(`/listings/${listing._id}`);
    }
    if (listing.seller.equals(req.user._id)) {
      req.flash("error", "You cannot send an inquiry to yourself.");
      return res.redirect(`/listings/${listing._id}`);
    }
    const { message } = req.body;
    if (!message || !message.trim()) {
      req.flash("error", "Message cannot be empty.");
      return res.redirect(`/listings/${listing._id}`);
    }
    if (message.trim().length > 500) {
      req.flash("error", "Message must be under 500 characters.");
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
    req.flash("error", "Failed to send inquiry. Please try again.");
    res.redirect(`/listings/${req.params.id}`);
  }
};

// GET /inquiries — seller views all received inquiries
exports.getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ seller: req.user._id })
      .populate("buyer", "name branch batch")
      .populate("listing", "title price")
      .sort({ createdAt: -1 });

    res.render("inquiries", {
      title: "Received Inquiries",
      inquiries,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

// POST /inquiries/:id/read — seller marks an inquiry as read
exports.markInquiryRead = async (req, res) => {
  try {
    // Use seller check to prevent one user marking another's inquiry
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { status: "read" }
    );
    if (!inquiry) {
      req.flash("error", "Inquiry not found.");
    }
    res.redirect("/inquiries");
  } catch (err) {
    req.flash("error", "Could not update inquiry.");
    res.redirect("/inquiries");
  }
};

// POST /inquiries/:id/accept — seller accepts the inquiry
exports.acceptInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { response: "accepted", status: "read" },
      { new: true }
    ).populate("buyer", "name email").populate("listing", "title");

    if (!inquiry) {
      req.flash("error", "Inquiry not found or you are not authorized.");
      return res.redirect("/inquiries");
    }

    // Flash a success message for the seller
    req.flash("success", `Accepted inquiry from ${inquiry.buyer.name}. An acceptance message will be visible to the buyer.`);
    res.redirect("/inquiries");
  } catch (err) {
    req.flash("error", "Could not accept inquiry.");
    res.redirect("/inquiries");
  }
};

// POST /inquiries/:id/reject — seller rejects the inquiry
exports.rejectInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { response: "rejected", status: "read" },
      { new: true }
    );

    if (!inquiry) {
      req.flash("error", "Inquiry not found or you are not authorized.");
      return res.redirect("/inquiries");
    }

    req.flash("success", "Inquiry rejected.");
    res.redirect("/inquiries");
  } catch (err) {
    req.flash("error", "Could not reject inquiry.");
    res.redirect("/inquiries");
  }
};

// GET /inquiries/sent — buyer views their sent inquiries
exports.getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ buyer: req.user._id })
      .populate("seller", "name email")
      .populate("listing", "title price")
      .sort({ createdAt: -1 });

    res.render("inquiries-sent", {
      title: "My Inquiries",
      inquiries,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};