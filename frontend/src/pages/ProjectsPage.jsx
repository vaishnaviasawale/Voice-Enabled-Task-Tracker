import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectContext";

export default function ProjectsPage() {
    const { projects, fetchProjects } = useProjects();
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");

    const navigate = useNavigate();

    // Create new project using backend POST
    const createProject = async () => {
        if (!newProjectName.trim()) return alert("Project name required");

        const res = await fetch("http://localhost:5000/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newProjectName,
                description: newProjectDesc,
            }),
        });

        if (!res.ok) {
            alert("Failed to create project");
            return;
        }

        // Clear fields + close modal
        setNewProjectName("");
        setNewProjectDesc("");
        setShowModal(false);

        // Reload context so new project is available everywhere
        await fetchProjects();
    };

    return (
        <div className="p-8">

            {/* ADD PROJECT BUTTON */}
            <button
                onClick={() => setShowModal(true)}
                className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
            >
                + Add Project
            </button>

            {/* PROJECT LIST */}
            <div className="flex flex-col gap-4">
                {projects.map((proj) => (
                    <div
                        key={proj.id}
                        className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border"
                        onClick={() => navigate(`/project/${proj.id}`)}
                    >
                        <h2 className="text-2xl font-semibold">{proj.name}</h2>
                        <p className="text-gray-600 mt-1">
                            {proj.description || "No description"}
                        </p>
                    </div>
                ))}

                {projects.length === 0 && (
                    <p className="text-gray-500 text-center mt-10">
                        No projects yet. Click “Add Project”.
                    </p>
                )}
            </div>

            {/* MODAL POPUP */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn">

                        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

                        <label className="block mb-2 text-gray-700">Project Name</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 mb-4"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="Enter project name"
                        />

                        <label className="block mb-2 text-gray-700">Description</label>
                        <textarea
                            className="w-full border rounded px-3 py-2 mb-4"
                            value={newProjectDesc}
                            onChange={(e) => setNewProjectDesc(e.target.value)}
                            placeholder="Describe the project..."
                        />

                        {/* Modal Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createProject}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Create
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
