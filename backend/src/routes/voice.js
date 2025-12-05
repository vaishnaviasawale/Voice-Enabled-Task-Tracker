const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { extractTaskDetailsFree } = require("../services/nlpFree");
const { transcribeAudioFree } = require("../services/transcribeFree");

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

/**
 * Input: Audio file (form-data, key: "audio")
 * Output: { transcript, task }
 */
router.post("/transcribe", upload.single("audio"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Audio file is required. Use form-data with key 'audio'" });
        }

        console.log(`Received audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);

        // Transcribe audio using local Whisper
        const transcript = await transcribeAudioFree(req.file.path);
        console.log(`Transcript: "${transcript}"`);

        // Parse transcript to extract task fields
        const task = extractTaskDetailsFree(transcript);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Return both transcript and parsed task
        res.json({
            transcript,
            task
        });
    } catch (err) {
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Transcription error:", err);
        next(err);
    }
});

module.exports = router;
