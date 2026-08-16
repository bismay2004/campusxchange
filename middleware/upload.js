// middleware/upload.js
// Multer configuration with Cloudinary support (fallbacks to disk when Cloudinary is not configured)
// Allows jpg, jpeg, png, webp only. Max 5MB per file.

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

let upload;

if (cloudinaryConfigured) {
  // Use Cloudinary storage for uploads
  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "campusxchange",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: (req, file) => `${req.user ? req.user._id : 'anon'}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
} else {
  // Fallback to disk storage (existing behavior)
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${req.user ? req.user._id : 'anon'}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, uniqueName);
    },
  });

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WEBP images are allowed."), false);
    }
  };

  upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
}

module.exports = upload;
