const { eq, and } = require("drizzle-orm");
const { db } = require("../db/db");
const { projects, tasks } = require("../db/schema");

const nowUnix = () => Math.floor(Date.now() / 1000);

// Create a new project (for authenticated user)
exports.createProject = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.userId;

        if (!name) return res.status(400).json({ error: "Name is required" });

        const result = await db.insert(projects).values({
            name,
            description: description || "",
            userId,
            createdAt: nowUnix(),
        }).returning();

        res.status(201).json({ ...result[0], tasks: [] });
    } catch (err) {
        next(err);
    }
};

// Get all projects for authenticated user (with their tasks)
exports.getAllProjects = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Only get projects belonging to this user
        const userProjects = await db
            .select()
            .from(projects)
            .where(eq(projects.userId, userId));

        // Fetch tasks for each project
        const projectsWithTasks = await Promise.all(
            userProjects.map(async (project) => {
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

// Get single project by ID (with tasks) - only if owned by user
exports.getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const project = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, Number(id)), eq(projects.userId, userId)))
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

// Update project by ID - only if owned by user
exports.updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user.userId;

        // Check ownership first
        const existing = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, Number(id)), eq(projects.userId, userId)))
            .limit(1);

        if (!existing[0]) {
            return res.status(404).json({ error: "Project not found" });
        }

        const updated = await db
            .update(projects)
            .set({
                ...(name && { name }),
                ...(description !== undefined && { description }),
            })
            .where(eq(projects.id, Number(id)))
            .returning();

        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
};

// Delete project by ID (cascade deletes all tasks) - only if owned by user
exports.deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const projectId = Number(id);

        // Check if project exists and belongs to user
        const project = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
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
