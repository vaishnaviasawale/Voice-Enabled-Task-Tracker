// src/components/TaskCard.jsx
import { useState } from "react";
import TaskDetailModal from "./TaskDetailModal";

// Priority styling
const priorityColors = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
};

// Format due date
const formatDueDate = (timestamp, status) => {
    if (!timestamp) return null;
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isOverdue = date < now && status !== "DONE";

    const formatted = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    return { formatted, isOverdue };
};

export default function TaskCard({ task, projectId, onUpdate }) {
    const [showModal, setShowModal] = useState(false);
    const dueInfo = formatDueDate(task.dueDate, task.status);

    const handleClick = (e) => {
        // Don't open modal if we're dragging
        if (e.defaultPrevented) return;
        setShowModal(true);
    };

    return (
        <>
            <div
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all select-none"
                onClick={handleClick}
            >
                {/* Title */}
                <h3 className="font-medium text-gray-900 text-sm truncate">{task.title}</h3>

                {/* Bottom row: Priority + Due date */}
                <div className="flex items-center justify-between mt-2">
                    {/* Priority badge */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                        {task.priority || "MEDIUM"}
                    </span>

                    {/* Due date */}
                    {dueInfo && (
                        <span className={`text-xs ${dueInfo.isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                            {dueInfo.formatted}
                        </span>
                    )}
                </div>
            </div>

            {/* Task Detail Modal */}
            {showModal && (
                <TaskDetailModal
                    task={task}
                    projectId={projectId}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
}
