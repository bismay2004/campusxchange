// utils/helpers.js — Small reusable helpers passed to EJS views

// Format a Date object as "12 Jun 2024"
function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Truncate long text for cards
function truncate(str, len = 80) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len).trim() + "…" : str;
}

// Format price as ₹1,200
function formatPrice(price) {
  return "₹" + Number(price).toLocaleString("en-IN");
}

module.exports = { formatDate, truncate, formatPrice };
