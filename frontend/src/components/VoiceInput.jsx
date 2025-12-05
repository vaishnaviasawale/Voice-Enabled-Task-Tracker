import React, { useState, useRef } from "react";
import VoiceTaskPreview from "./VoiceTaskPreview";

const VoiceInput = ({ projectId }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [parsedTask, setParsedTask] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Create audio blob
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

                // Send to backend for transcription
                await sendAudioToBackend(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            setError("Could not access microphone. Please allow microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioToBackend = async (audioBlob) => {
        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            const res = await fetch("http://localhost:5000/voice/transcribe", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to process audio");
            }

            const data = await res.json();
            console.log("Voice response:", data);

            setTranscript(data.transcript);
            setParsedTask(data.task);
            setShowPreview(true);
        } catch (err) {
            console.error("Error processing audio:", err);
            setError(err.message || "Failed to process your voice input");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setTranscript("");
        setParsedTask(null);
    };

    return (
        <>
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2 ${isProcessing
                        ? "bg-gray-400 cursor-wait"
                        : isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : "bg-purple-600 hover:bg-purple-700"
                    }`}
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </>
                ) : isRecording ? (
                    <>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        Stop Recording
                    </>
                ) : (
                    <>
                        🎤 Voice Task
                    </>
                )}
            </button>

            {/* Recording indicator */}
            {isRecording && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    Recording... Click button to stop
                </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Transcribing your voice...
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-1 right-2 text-white/70 hover:text-white"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && parsedTask && (
                <VoiceTaskPreview
                    parsedTask={{ ...parsedTask, rawTranscript: transcript }}
                    projectId={projectId}
                    onClose={handleClosePreview}
                />
            )}
        </>
    );
};

export default VoiceInput;
