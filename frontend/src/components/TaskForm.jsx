import React, { useState } from "react";

const API_URL = "http://localhost:5000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

const TaskForm = ({ projectId, onClose, onTaskCreated }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("TODO");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = async () => {
        if (!title.trim()) return;

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
                    projectId
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
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description (optional)"
                            rows={3}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        disabled={!title.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        Create Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskForm;
