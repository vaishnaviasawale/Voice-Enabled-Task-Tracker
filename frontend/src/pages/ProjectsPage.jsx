import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectContext";

export default function ProjectsPage() {
    const { projects, fetchProjects } = useProjects();
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");

    const navigate = useNavigate();

    // Open modal for creating new project
    const openCreateModal = () => {
        setEditingProject(null);
        setProjectName("");
        setProjectDesc("");
        setShowModal(true);
    };

    // Open modal for editing existing project
    const openEditModal = (e, project) => {
        e.stopPropagation(); // Prevent navigation
        setEditingProject(project);
        setProjectName(project.name);
        setProjectDesc(project.description || "");
        setShowModal(true);
    };

    // Create new project
    const createProject = async () => {
        if (!projectName.trim()) return alert("Project name required");

        const res = await fetch("http://localhost:5000/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: projectName,
                description: projectDesc,
            }),
        });

        if (!res.ok) {
            alert("Failed to create project");
            return;
        }

        closeModal();
        await fetchProjects();
    };

    // Update existing project
    const updateProject = async () => {
        if (!projectName.trim()) return alert("Project name required");

        const res = await fetch(`http://localhost:5000/projects/${editingProject.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: projectName,
                description: projectDesc,
            }),
        });

        if (!res.ok) {
            alert("Failed to update project");
            return;
        }

        closeModal();
        await fetchProjects();
    };

    // Delete project with confirmation
    const deleteProject = async (e, project) => {
        e.stopPropagation(); // Prevent navigation

        const taskCount = project.tasks?.length || 0;
        const confirmMessage = taskCount > 0
            ? `Delete "${project.name}" and its ${taskCount} task(s)? This cannot be undone.`
            : `Delete "${project.name}"? This cannot be undone.`;

        if (!window.confirm(confirmMessage)) return;

        const res = await fetch(`http://localhost:5000/projects/${project.id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            alert("Failed to delete project");
            return;
        }

        await fetchProjects();
    };

    // Close modal and reset state
    const closeModal = () => {
        setShowModal(false);
        setEditingProject(null);
        setProjectName("");
        setProjectDesc("");
    };

    // Handle form submit
    const handleSubmit = () => {
        if (editingProject) {
            updateProject();
        } else {
            createProject();
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Project
                </button>
            </div>

            {/* PROJECT LIST */}
            <div className="flex flex-col gap-4">
                {projects.map((proj) => (
                    <div
                        key={proj.id}
                        className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border group"
                        onClick={() => navigate(`/project/${proj.id}`)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold">{proj.name}</h2>
                                <p className="text-gray-600 mt-1">
                                    {proj.description || "No description"}
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    {proj.tasks?.length || 0} task(s)
                                </p>
                            </div>

                            {/* Edit/Delete buttons - show on hover */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => openEditModal(e, proj)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit project"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => deleteProject(e, proj)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete project"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <p className="text-gray-500 text-center mt-10">
                        No projects yet. Click "Add Project" to get started.
                    </p>
                )}
            </div>

            {/* CREATE/EDIT MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {editingProject ? "Edit Project" : "Create New Project"}
                            </h2>
                            <button
                                onClick={closeModal}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Enter project name"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={projectDesc}
                                    onChange={(e) => setProjectDesc(e.target.value)}
                                    placeholder="Describe the project (optional)"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!projectName.trim()}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                {editingProject ? "Save Changes" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
