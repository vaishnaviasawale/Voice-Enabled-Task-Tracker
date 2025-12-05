const { eq } = require("drizzle-orm");
const { db } = require("../db/db");
const { projects, tasks } = require("../db/schema");

// Create a new project
exports.createProject = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const result = await db.insert(projects).values({
            name,
            description: description || "",
        }).returning();

        res.status(201).json({ ...result[0], tasks: [] });
    } catch (err) {
        next(err);
    }
};

// Get all projects (with their tasks)
exports.getAllProjects = async (req, res, next) => {
    try {
        const allProjects = await db.select().from(projects);

        // Fetch tasks for each project
        const projectsWithTasks = await Promise.all(
            allProjects.map(async (project) => {
                const projectTasks = await db
                    .select()
                    .from(tasks)
                    .where(eq(tasks.projectId, project.id));
                return { ...project, tasks: projectTasks };
            })
        );

        res.json(projectsWithTasks);
    } catch (err) {
        next(err);
    }
};

// Get single project by ID (with tasks)
exports.getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const project = await db
            .select()
            .from(projects)
            .where(eq(projects.id, Number(id)))
            .limit(1);

        if (!project[0]) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Fetch tasks for this project
        const projectTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.projectId, Number(id)));

        res.json({ ...project[0], tasks: projectTasks });
    } catch (err) {
        next(err);
    }
};

// Update project by ID
exports.updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updated = await db
            .update(projects)
            .set({
                ...(name && { name }),
                ...(description !== undefined && { description }),
            })
            .where(eq(projects.id, Number(id)))
            .returning();

        if (!updated[0]) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
};

// Delete project by ID (cascade deletes all tasks)
exports.deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const projectId = Number(id);

        // Check if project exists
        const project = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!project[0]) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Delete all tasks associated with this project first
        const deletedTasks = await db
            .delete(tasks)
            .where(eq(tasks.projectId, projectId))
            .returning();

        // Delete the project
        const deleted = await db
            .delete(projects)
            .where(eq(projects.id, projectId))
            .returning();

        res.json({
            message: "Project and all associated tasks deleted",
            project: deleted[0],
            tasksDeleted: deletedTasks.length,
        });
    } catch (err) {
        next(err);
    }
};

