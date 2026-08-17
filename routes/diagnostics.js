const express = require('express');
const router = express.Router();
const diagnostics = require('../controllers/diagnosticsController');

// Public diagnostics endpoint to help debug upload issues — does NOT return secrets
router.get('/', diagnostics.getStatus);

module.exports = router;
