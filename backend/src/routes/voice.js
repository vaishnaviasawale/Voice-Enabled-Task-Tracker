const express = require("express");
const multer = require("multer");
const voiceController = require("../controllers/voiceController");

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

router.post("/transcribe", upload.single("audio"), voiceController.transcribeAndParse);

module.exports = router;
