const express = require("express");
const multer = require("multer");
const { transcribeAudio, parseTranscript } = require("../controllers/voice");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/transcribe", upload.single("audio"), transcribeAudio);
router.post("/parse", parseTranscript);

module.exports = router;
