const express = require("express");
const multer = require("multer");
const voiceController = require("../controllers/voiceController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Voice routes require authentication
router.use(authenticate);

router.post("/transcribe", upload.single("audio"), voiceController.transcribeAndParse);

module.exports = router;
