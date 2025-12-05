// src/components/TaskDetailModal.jsx
import { useState } from "react";

const API_URL = "http://localhost:5000";

const priorityColors = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
};

const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    DONE: "bg-emerald-100 text-emerald-800",
};

const statusLabels = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export default function TaskDetailModal({ task, projectId, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Editable fields
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState(task.priority || "MEDIUM");
    const [status, setStatus] = useState(task.status || "TODO");
    const [dueDate, setDueDate] = useState(
        task.dueDate ? new Date(task.dueDate * 1000).toISOString().slice(0, 16) : ""
    );

    const formatDisplayDate = (timestamp) => {
        if (!timestamp) return "Not set";
        return new Date(timestamp * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/tasks/${task.id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                    status,
                    dueDate: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : null,
                }),
            });
            if (!res.ok) throw new Error("Failed to update task");
            const updatedTask = await res.json();

            // Update parent state
            if (onUpdate) {
                onUpdate(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t => t.id === task.id ? updatedTask : t)
                }));
            }
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/tasks/${task.id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Failed to delete task");

            // Update parent state
            if (onUpdate) {
                onUpdate(prev => ({
                    ...prev,
                    tasks: prev.tasks.filter(t => t.id !== task.id)
                }));
            }
            onClose();
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    // Quick status change (for mobile)
    const handleQuickStatusChange = async (newStatus) => {
        try {
            const res = await fetch(`${API_URL}/tasks/${task.id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to change status");

            // Update parent state
            if (onUpdate) {
                onUpdate(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t =>
                        t.id === task.id ? { ...t, status: newStatus } : t
                    )
                }));
            }
            onClose();
        } catch (err) {
            console.error("Failed to change status:", err);
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
                    <h2 className="text-lg font-semibold text-gray-800">Task Details</h2>
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
                    {isEditing ? (
                        /* Edit Mode */
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
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
                        </>
                    ) : (
                        /* View Mode */
                        <>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                <p className="text-gray-700">
                                    {task.description || <span className="text-gray-400 italic">No description</span>}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                                    <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${statusColors[task.status]}`}>
                                        {statusLabels[task.status] || "To Do"}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                                    <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${priorityColors[task.priority]}`}>
                                        {task.priority || "MEDIUM"}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Status Change Buttons */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Move to:</label>
                                <div className="flex flex-wrap gap-2">
                                    {task.status !== "TODO" && (
                                        <button
                                            onClick={() => handleQuickStatusChange("TODO")}
                                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            To Do
                                        </button>
                                    )}
                                    {task.status !== "IN_PROGRESS" && (
                                        <button
                                            onClick={() => handleQuickStatusChange("IN_PROGRESS")}
                                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            In Progress
                                        </button>
                                    )}
                                    {task.status !== "DONE" && (
                                        <button
                                            onClick={() => handleQuickStatusChange("DONE")}
                                            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Due Date</label>
                                <p className="text-gray-700">{formatDisplayDate(task.dueDate)}</p>
                            </div>

                            {(task.createdAt || task.updatedAt) && (
                                <div className="pt-3 border-t space-y-1">
                                    {task.createdAt && (
                                        <p className="text-xs text-gray-400">
                                            Created: {formatDisplayDate(task.createdAt)}
                                        </p>
                                    )}
                                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                                        <p className="text-xs text-gray-400">
                                            Last updated: {formatDisplayDate(task.updatedAt)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
                    {confirmDelete ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-red-600">Delete this task?</span>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Delete
                            </button>

                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Edit Task
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
