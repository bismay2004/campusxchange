// middleware/errorHandler.js
// Centralized error handling middleware.
// Express calls globalError when next(err) is called anywhere.

exports.notFound = (req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
};

exports.globalError = (err, req, res, next) => {
  console.error(err.stack);

  // Handle Mongoose CastError — invalid ObjectId (e.g. /listings/not-a-valid-id)
  // Without this, the user sees a raw stack trace instead of a clean 404
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(404).render("404", { title: "Page Not Found" });
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    req.flash && req.flash("error", message);
    return res.redirect("back");
  }

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err.message;

  res.status(status).render("error", { title: "Error", message, status });
};
