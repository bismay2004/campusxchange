// app.js — Main entry point for CampusXchange
require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const helmet = require("helmet");

const connectDB = require("./config/database");
const configurePassport = require("./config/passport");
const { notFound, globalError } = require("./middleware/errorHandler");
const { formatDate, truncate, formatPrice } = require("./utils/helpers");

// Route modules — all imported at top, not inside handlers
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const userRoutes = require("./routes/users");
const inquiryRoutes = require("./routes/inquiries");
const reportRoutes = require("./routes/reports");
const listingController = require("./controllers/listingController");

const app = express();

// When deployed behind a reverse proxy (Heroku, Vercel, nginx), enable trust proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── Database ──────────────────────────────────────────────
connectDB();

// ─── View Engine ───────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─── Security Headers ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── Static Files ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Body Parsing ──────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Method Override ───────────────────────────────────────
// Allows HTML forms to fake PUT/DELETE via ?_method=PUT query param
app.use(methodOverride("_method"));

// ─── Session ───────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret_change_in_production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// ─── Passport Authentication ───────────────────────────────
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// ─── Flash Messages ────────────────────────────────────────
app.use(flash());

// ─── Global Template Variables ─────────────────────────────
// Injected automatically into every EJS render — no need to pass manually
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.formatDate = formatDate;
  res.locals.truncate = truncate;
  res.locals.formatPrice = formatPrice;
  next();
});

// ─── Routes ────────────────────────────────────────────────
app.get("/", async (req, res, next) => {
  try {
    const recentListings = await listingController.getRecentListings();
    res.render("home", {
      title: "CampusXchange — Buy & Sell Within Your Campus",
      recentListings,
    });
  } catch (err) {
    next(err);
  }
});

app.use("/", authRoutes);
app.use("/listings", listingRoutes);
app.use("/inquiries", inquiryRoutes);
app.use("/reports", reportRoutes);
app.use("/", userRoutes);

// ─── 404 & Error Handlers ──────────────────────────────────
app.use(notFound);
app.use(globalError);

// ─── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CampusXchange running at http://localhost:${PORT}`);
});
