// src/routes/task.js
const express = require("express");
const { eq } = require("drizzle-orm");
const { db } = require("../db/db");
const { tasks, projects, Priority, Status } = require("../db/schema");

const router = express.Router();

const nowUnix = () => Math.floor(Date.now() / 1000);

// Create a new task
router.post("/", async (req, res, next) => {
    try {
        const { title, description, priority, status, dueDate, projectId } = req.body;

        if (!title || typeof title !== "string") {
            return res.status(400).json({ error: "title is required" });
        }

        // Validate enums
        const validatedPriority = Object.values(Priority).includes(priority) ? priority : Priority.MEDIUM;
        const validatedStatus = Object.values(Status).includes(status) ? status : Status.TODO;

        // Optional project check
        if (projectId !== undefined && projectId !== null) {
            const proj = await db.select().from(projects).where(eq(projects.id, Number(projectId))).limit(1);
            if (!proj[0]) return res.status(400).json({ error: "projectId does not exist" });
        }

        const inserted = await db
            .insert(tasks)
            .values({
                title,
                description: description || "",
                priority: validatedPriority,
                status: validatedStatus,
                dueDate: dueDate ? Number(dueDate) : null,
                projectId: projectId ? Number(projectId) : null,
                createdAt: nowUnix(),
                updatedAt: nowUnix(),
            })
            .returning();

        res.status(201).json(inserted[0]);
    } catch (err) {
        next(err);
    }
});

// Get all tasks (with optional filters)
router.get("/", async (req, res, next) => {
    try {
        const { status, priority, projectId, search } = req.query;

        let query = db.select().from(tasks);

        if (status && Object.values(Status).includes(status)) {
            query = query.where(eq(tasks.status, status));
        }
        if (priority && Object.values(Priority).includes(priority)) {
            query = query.where(eq(tasks.priority, priority));
        }
        if (projectId) {
            query = query.where(eq(tasks.projectId, Number(projectId)));
        }

        let rows = await query.all ? await query.all() : await query;

        if (search && typeof search === "string") {
            const s = search.toLowerCase();
            rows = rows.filter(
                (r) =>
                    (r.title && r.title.toLowerCase().includes(s)) ||
                    (r.description && r.description.toLowerCase().includes(s))
            );
        }

        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// Get single task by ID
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await db.select().from(tasks).where(eq(tasks.id, Number(id))).limit(1);
        if (!task[0]) return res.status(404).json({ error: "Task not found" });
        res.json(task[0]);
    } catch (err) {
        next(err);
    }
});

// Update task by ID
router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, dueDate, projectId } = req.body;

        if (priority && !Object.values(Priority).includes(priority)) {
            return res.status(400).json({ error: "Invalid priority value" });
        }
        if (status && !Object.values(Status).includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }
        if (projectId !== undefined && projectId !== null) {
            const proj = await db.select().from(projects).where(eq(projects.id, Number(projectId))).limit(1);
            if (!proj[0]) return res.status(400).json({ error: "projectId does not exist" });
        }

        const updated = await db
            .update(tasks)
            .set({
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(priority !== undefined && { priority }),
                ...(status !== undefined && { status }),
                ...(dueDate !== undefined && { dueDate: dueDate ? Number(dueDate) : null }),
                ...(projectId !== undefined && { projectId: projectId === null ? null : Number(projectId) }),
                updatedAt: nowUnix(),
            })
            .where(eq(tasks.id, Number(id)))
            .returning();

        if (!updated[0]) return res.status(404).json({ error: "Task not found" });
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

// Delete task by ID
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await db.delete(tasks).where(eq(tasks.id, Number(id))).returning();
        if (!deleted[0]) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task deleted", task: deleted[0] });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
