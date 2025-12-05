// Local transcription using Whisper via transformers.js
const { pipeline } = require("@xenova/transformers");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const { WaveFile } = require("wavefile");

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

let transcriber = null;

// Initialize the Whisper model
const getTranscriber = async () => {
    if (!transcriber) {
        console.log("Loading Whisper model (first time may take a minute to download)...");
        transcriber = await pipeline(
            "automatic-speech-recognition",
            "Xenova/whisper-tiny.en" // Small English model
        );
        console.log("Whisper model loaded!");
    }
    return transcriber;
};

/**
 * Convert audio file to WAV format using ffmpeg
 * @param {string} inputPath - Path to input audio file
 * @returns {Promise<string>} - Path to converted WAV file
 */
const convertToWav = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = inputPath + ".wav";

        ffmpeg(inputPath)
            .audioFrequency(16000)  // 16kHz for Whisper
            .audioChannels(1)       // Mono
            .audioCodec("pcm_s16le") // 16-bit PCM
            .format("wav")
            .on("end", () => {
                console.log("Audio converted to WAV");
                resolve(outputPath);
            })
            .on("error", (err) => {
                console.error("FFmpeg error:", err);
                reject(err);
            })
            .save(outputPath);
    });
};

/**
 * Read WAV file and convert to Float32Array
 * @param {string} wavPath - Path to WAV file
 * @returns {Float32Array} - Audio samples
 */
const readWavAsFloat32 = (wavPath) => {
    const buffer = fs.readFileSync(wavPath);
    const wav = new WaveFile(buffer);

    // Get samples as 16-bit integers
    const samples = wav.getSamples(false, Int16Array);

    // Convert to Float32Array normalized to [-1, 1]
    const float32 = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
        float32[i] = samples[i] / 32768.0;
    }

    return float32;
};

/**
 * Transcribe audio file using local Whisper model
 * @param {string} audioPath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
exports.transcribeAudio = async (audioPath) => {
    const whisper = await getTranscriber();

    console.log(`Converting audio to WAV format...`);

    // Convert to WAV format
    const wavPath = await convertToWav(audioPath);

    console.log(`Reading WAV file...`);

    // Read WAV as Float32Array
    const audioData = readWavAsFloat32(wavPath);

    console.log(`Audio data: ${audioData.length} samples (${(audioData.length / 16000).toFixed(2)} seconds)`);

    // Clean up WAV file
    fs.unlinkSync(wavPath);

    // Transcribe
    console.log(`Transcribing...`);
    const result = await whisper(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: false,
    });

    console.log(`Transcription complete: "${result.text}"`);

    return result.text.trim();
};

