// controllers/diagnosticsController.js
// Safe diagnostics endpoint (no secrets returned)

const fs = require('fs');
const path = require('path');

exports.getStatus = async (req, res) => {
  try {
    const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    let cloudinaryModule = false;
    try { require.resolve('cloudinary'); cloudinaryModule = true; } catch (e) { cloudinaryModule = false; }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const uploadsExists = fs.existsSync(uploadsDir);
    let uploadsWritable = false;
    try {
      const testFile = path.join(uploadsDir, '.diag_write_test');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
      uploadsWritable = true;
    } catch (e) {
      uploadsWritable = false;
    }

    // Check installed multer-storage-cloudinary
    let cloudinaryStorageModule = false;
    try { require.resolve('multer-storage-cloudinary'); cloudinaryStorageModule = true; } catch (e) { cloudinaryStorageModule = false; }

    return res.json({
      ok: true,
      cloudinaryConfigured,
      cloudinaryModule,
      cloudinaryStorageModule,
      uploadsDirExists: uploadsExists,
      uploadsWritable,
      nodeEnv: process.env.NODE_ENV || 'development',
      maxUploadSizeBytes: 5 * 1024 * 1024
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};