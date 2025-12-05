const fs = require("fs");
const { extractTaskDetailsFree } = require("../services/nlpFree");
const { transcribeAudioFree } = require("../services/transcribeFree");

// Transcribe audio and parse to task
exports.transcribeAndParse = async (req, res, next) => {
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
};

