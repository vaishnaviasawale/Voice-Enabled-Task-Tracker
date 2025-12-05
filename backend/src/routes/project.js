const express = require("express");
const { db } = require("../db/db");
const { projects, tasks } = require("../db/schema");
const { eq } = require("drizzle-orm");

const router = express.Router();

// Create a new project
router.post("/", async (req, res, next) => {
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
});

// Get all projects (with their tasks)
router.get("/", async (req, res, next) => {
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
});

// Get single project by ID (with tasks)
router.get("/:id", async (req, res, next) => {
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
});

// Update project by ID
router.put("/:id", async (req, res, next) => {
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
});

// Delete project by ID
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await db
            .delete(projects)
            .where(eq(projects.id, Number(id)))
            .returning();

        if (!deleted[0]) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json({
            message: "Project deleted",
            project: deleted[0],
        });
    } catch (err) {
        next(err);
    }
});


module.exports = router;
