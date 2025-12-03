const fs = require("fs");
const OpenAI = require("openai");
const { extractTaskDetails } = require("../services/nlp");

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

exports.transcribeAudio = async (req, res, next) => {
    try {
        const transcript = await client.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: "whisper-1"
        });

        fs.unlinkSync(req.file.path);

        res.json({ transcript: transcript.text });
    } catch (err) {
        next(err);
    }
};

exports.parseTranscript = async (req, res, next) => {
    try {
        const parsed = await extractTaskDetails(req.body.transcript);
        res.json(parsed);
    } catch (err) {
        next(err);
    }
};
