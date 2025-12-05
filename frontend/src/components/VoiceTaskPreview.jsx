import React, { useState } from "react";

const API_URL = "http://localhost:5000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

const VoiceTaskPreview = ({ parsedTask, projectId, onClose, onTaskCreated }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Editable fields initialized from parsed task
    const [title, setTitle] = useState(parsedTask.title || "");
    const [description, setDescription] = useState(parsedTask.description || "");
    const [priority, setPriority] = useState(parsedTask.priority || "MEDIUM");
    const [status, setStatus] = useState(parsedTask.status || "TODO");
    const [dueDate, setDueDate] = useState(
        parsedTask.dueDate 
            ? new Date(parsedTask.dueDate * 1000).toISOString().slice(0, 16) 
            : ""
    );

    const handleSubmit = async () => {
        if (!title.trim()) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                    status,
                    dueDate: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : null,
                    projectId,
                }),
            });
            
            if (!res.ok) throw new Error("Failed to create task");
            const newTask = await res.json();
            
            // Notify parent of new task
            if (onTaskCreated) {
                onTaskCreated(newTask);
            }
            
            onClose();
        } catch (err) {
            console.error("Failed to create task:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateForDisplay = (timestamp) => {
        if (!timestamp) return "Not set";
        return new Date(timestamp * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <span className="text-xl">🎤</span>
                        <h2 className="text-lg font-semibold">Voice Task Preview</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-purple-200 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Raw transcript */}
                <div className="px-6 py-3 bg-purple-50 border-b">
                    <p className="text-sm text-purple-700">
                        <span className="font-medium">You said:</span> "{parsedTask.rawTranscript}"
                    </p>
                </div>

                {/* Editable Fields */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Task title"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Add more details (optional)"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select 
                                value={priority} 
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                            {parsedTask.dueDate && (
                                <span className="text-purple-600 font-normal ml-2">
                                    (detected: {formatDateForDisplay(parsedTask.dueDate)})
                                </span>
                            )}
                        </label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || isSubmitting}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating...
                            </>
                        ) : (
                            "Create Task"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceTaskPreview;
