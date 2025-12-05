// src/components/KanbanBoard.jsx
import { useState, useRef } from "react";
import { useProjects } from "../context/ProjectContext";
import TaskCard from "./TaskCard";

const columns = ["TODO", "IN_PROGRESS", "DONE"];

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

export default function KanbanBoard({ projectId }) {
    const { projects, moveTask, searchQuery, filters } = useProjects();
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const columnRefs = useRef({});

    const project = projects.find((p) => p.id === projectId);

    if (!project) return <p className="p-4">Loading project...</p>;
    if (!project.tasks) return <p>No tasks exist.</p>;

    // Filter tasks based on search query and filters
    const filteredTasks = project.tasks.filter((task) => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (!checkDueDateFilter(task, filters.dueDate)) return false;
        return true;
    });

    // Mouse drag handlers
    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, col) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumn(col);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const taskId = Number(e.dataTransfer.getData("taskId"));
        if (taskId) {
            moveTask(projectId, taskId, newStatus);
        }
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    // Touch drag handlers
    const handleTouchStart = (e, task) => {
        setDraggedTask(task);
    };

    const handleTouchMove = (e) => {
        if (!draggedTask) return;

        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find which column we're over
        for (const col of columns) {
            const colElement = columnRefs.current[col];
            if (colElement && colElement.contains(element)) {
                setDragOverColumn(col);
                return;
            }
        }
        setDragOverColumn(null);
    };

    const handleTouchEnd = () => {
        if (draggedTask && dragOverColumn && draggedTask.status !== dragOverColumn) {
            moveTask(projectId, draggedTask.id, dragOverColumn);
        }
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const columnLabels = {
        TODO: "To Do",
        IN_PROGRESS: "In Progress",
        DONE: "Done"
    };

    const columnColors = {
        TODO: "bg-gray-100 border-gray-300",
        IN_PROGRESS: "bg-blue-50 border-blue-300",
        DONE: "bg-green-50 border-green-300"
    };

    const getColumnClass = (col) => {
        let baseClass = `${columnColors[col]} border-2 p-4 rounded-lg min-h-[300px] transition-all duration-200`;
        if (dragOverColumn === col) {
            baseClass += " border-solid border-blue-500 bg-blue-100 scale-[1.02]";
        } else {
            baseClass += " border-dashed";
        }
        return baseClass;
    };

    return (
        <div
            className="mt-6"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Single responsive grid - works for all screen sizes */}
            <div className="overflow-x-auto pb-4">
                <div className="grid grid-cols-3 gap-4 min-w-[700px]">
                    {columns.map((col) => (
                        <div
                            key={col}
                            ref={(el) => (columnRefs.current[col] = el)}
                            onDragOver={(e) => handleDragOver(e, col)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col)}
                            className={getColumnClass(col)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-bold text-gray-700">{columnLabels[col]}</h2>
                                <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                    {filteredTasks.filter((t) => t.status === col).length}
                                </span>
                            </div>

                            {filteredTasks
                                .filter((t) => t.status === col)
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        onDragEnd={handleDragEnd}
                                        onTouchStart={(e) => handleTouchStart(e, task)}
                                        className={`${draggedTask?.id === task.id ? "opacity-50" : ""}`}
                                    >
                                        <TaskCard task={task} projectId={projectId} />
                                    </div>
                                ))}

                            {/* Drop zone indicator when empty */}
                            {filteredTasks.filter((t) => t.status === col).length === 0 && (
                                <div className="h-20 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                                    Drop tasks here
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-400 text-center mt-2">
                Drag cards to move between columns • Tap card for details & quick status change
            </p>
        </div>
    );
}
