import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import KanbanBoard from "../components/KanbanBoard";
import SearchBar from "../components/SearchBar";
import VoiceInput from "../components/VoiceInput";

const ProjectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isListView, setIsListView] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);

    const toggleView = () => setIsListView((prev) => !prev);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`http://localhost:5000/projects/${id}`);
                if (!res.ok) throw new Error("Project not found");
                const data = await res.json();
                setProject(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) return <p className="p-4">Loading...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            {/* Back Button */}
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
            </button>

            <h1 className="text-3xl font-bold mb-6">{project.name}</h1>

            {/* Buttons Row */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => setShowTaskModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Add Task
                </button>

                <VoiceInput projectId={project.id} />

                <button
                    onClick={toggleView}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                >
                    {isListView ? "Switch to Board View" : "Switch to List View"}
                </button>
            </div>

            <SearchBar />

            {/* Task View */}
            {isListView ? (
                <TaskList projectId={project.id} />
            ) : (
                <KanbanBoard projectId={project.id} />
            )}

            {/* Task Form Modal */}
            {showTaskModal && (
                <TaskForm
                    projectId={project.id}
                    onClose={() => setShowTaskModal(false)}
                />
            )}
        </div>
    );
};

export default ProjectPage;
