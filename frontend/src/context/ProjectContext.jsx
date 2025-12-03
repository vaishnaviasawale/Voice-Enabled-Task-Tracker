import React, { createContext, useState, useContext } from "react";

// 1. Create the context
const ProjectContext = createContext();

// 2. Provider component
export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);

    // Example: fetch projects from API
    const fetchProjects = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/projects`);
        const data = await res.json();
        setProjects(data);
    };

    // Example: select a project
    const selectProject = (project) => {
        setCurrentProject(project);
    };

    return (
        <ProjectContext.Provider
            value={{
                projects,
                currentProject,
                fetchProjects,
                selectProject,
                setProjects,
                setCurrentProject,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

// 3. Custom hook to use context easily
export const useProjects = () => useContext(ProjectContext);
