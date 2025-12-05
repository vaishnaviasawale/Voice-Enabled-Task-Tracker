// src/components/TaskList.jsx
import { useState } from "react";
import { useProjects } from "../context/ProjectContext";
import TaskDetailModal from "./TaskDetailModal";

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

const formatDueDate = (timestamp, status) => {
    if (!timestamp) return { formatted: "—", isOverdue: false };
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isOverdue = date < now && status !== "DONE";

    const formatted = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return { formatted, isOverdue };
};

// Helper to check due date filter
const checkDueDateFilter = (task, dueDateFilter) => {
    if (!dueDateFilter) return true;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (dueDateFilter === "no-date") {
        return !task.dueDate;
    }

    if (!task.dueDate) return false;

    const dueDate = new Date(task.dueDate * 1000);

    switch (dueDateFilter) {
        case "overdue":
            return dueDate < now && task.status !== "DONE";
        case "today":
            return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case "week":
            return dueDate >= today && dueDate <= weekEnd;
        default:
            return true;
    }
};

export default function TaskList({ project, onUpdate }) {
    const { searchQuery, filters } = useProjects();
    const [selectedTask, setSelectedTask] = useState(null);

    if (!project) return <p className="p-4">Loading project...</p>;

    // Filter tasks based on search query and filters
    const tasks = (project.tasks ?? []).filter((task) => {
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // Status filter
        if (filters.status && task.status !== filters.status) return false;

        // Priority filter
        if (filters.priority && task.priority !== filters.priority) return false;

        // Due date filter
        if (!checkDueDateFilter(task, filters.dueDate)) return false;

        return true;
    });

    return (
        <div className="mt-5">
            <h2 className="text-xl font-bold mb-4">All Tasks</h2>

            {tasks.length === 0 ? (
                <p className="text-gray-500">
                    {(searchQuery.trim() || filters.status || filters.priority || filters.dueDate)
                        ? "No tasks match your filters."
                        : "No tasks yet."}
                </p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b font-semibold text-sm text-gray-600">
                        <div className="col-span-3">Task</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Priority</div>
                        <div className="col-span-2">Due Date</div>
                        <div className="col-span-3">Updated</div>
                    </div>

                    {/* Task Rows */}
                    {tasks.map((task) => {
                        const dueInfo = formatDueDate(task.dueDate, task.status);
                        const updatedDate = task.updatedAt
                            ? new Date(task.updatedAt * 1000).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            : "—";

                        return (
                            <div
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className="grid grid-cols-12 gap-4 px-4 py-4 border-b last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors items-center"
                            >
                                {/* Task Title & Description */}
                                <div className="col-span-3">
                                    <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-gray-500 truncate mt-0.5">{task.description}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="col-span-2">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[task.status] || statusColors.TODO}`}>
                                        {statusLabels[task.status] || "To Do"}
                                    </span>
                                </div>

                                {/* Priority */}
                                <div className="col-span-2">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                                        {task.priority || "MEDIUM"}
                                    </span>
                                </div>

                                {/* Due Date */}
                                <div className="col-span-2">
                                    <span className={`text-sm ${dueInfo.isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                                        {dueInfo.isOverdue && "⚠ "}{dueInfo.formatted}
                                    </span>
                                </div>

                                {/* Updated Date */}
                                <div className="col-span-3 text-sm text-gray-500">
                                    {updatedDate}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    projectId={project.id}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}
