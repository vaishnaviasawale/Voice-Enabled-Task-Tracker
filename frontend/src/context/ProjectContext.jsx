// src/context/ProjectContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const API_URL = "http://localhost:5000";

const ProjectContext = createContext();
export const useProjects = () => useContext(ProjectContext);

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        status: "",      // "", "TODO", "IN_PROGRESS", "DONE"
        priority: "",    // "", "LOW", "MEDIUM", "HIGH"
        dueDate: "",     // "", "overdue", "today", "week", "no-date"
    });

    // Fetch all projects for current user
    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/projects`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                if (res.status === 401) {
                    setProjects([]);
                    return;
                }
                throw new Error("Failed to fetch projects");
            }
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setProjects([]);
        }
    }, []);

    // Clear projects (on logout)
    const clearProjects = () => {
        setProjects([]);
    };

    // Add task TO a specific project via API
    const addTask = async (projectId, taskData) => {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...taskData, projectId }),
            });
            if (!res.ok) throw new Error("Failed to create task");
            const newTask = await res.json();

            // Update local state
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === projectId
                        ? { ...project, tasks: [...(project.tasks || []), newTask] }
                        : project
                )
            );
            return newTask;
        } catch (err) {
            console.error("Error adding task:", err);
            throw err;
        }
    };

    // Update task via API
    const updateTask = async (taskId, updatedData) => {
        try {
            const res = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error("Failed to update task");
            const updatedTask = await res.json();

            // Update local state
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === updatedData.projectId
                        ? {
                            ...project,
                            tasks: (project.tasks || []).map((t) =>
                                t.id === taskId ? updatedTask : t
                            ),
                        }
                        : project
                )
            );
            return updatedTask;
        } catch (err) {
            console.error("Error updating task:", err);
            throw err;
        }
    };

    // Move task between columns (Kanban) via API
    const moveTask = async (projectId, taskId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to move task");

            // Update local state
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === projectId
                        ? {
                            ...project,
                            tasks: (project.tasks || []).map((t) =>
                                t.id === taskId ? { ...t, status: newStatus } : t
                            ),
                        }
                        : project
                )
            );
        } catch (err) {
            console.error("Error moving task:", err);
        }
    };

    // Delete task via API
    const deleteTask = async (taskId, projectId) => {
        try {
            const res = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Failed to delete task");

            // Update local state
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === projectId
                        ? {
                            ...project,
                            tasks: (project.tasks || []).filter((t) => t.id !== taskId),
                        }
                        : project
                )
            );
        } catch (err) {
            console.error("Error deleting task:", err);
            throw err;
        }
    };

    return (
        <ProjectContext.Provider
            value={{
                projects,
                addTask,
                updateTask,
                moveTask,
                deleteTask,
                fetchProjects,
                clearProjects,
                searchQuery,
                setSearchQuery,
                filters,
                setFilters,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};
