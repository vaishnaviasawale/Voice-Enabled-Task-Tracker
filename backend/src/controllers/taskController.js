const { eq } = require("drizzle-orm");
const { db } = require("../db/db");
const { tasks, projects, users, Priority, Status } = require("../db/schema");
const { sendEmail } = require("../services/emailService");

const nowUnix = () => Math.floor(Date.now() / 1000);

// Helper to get user email and project name for notifications
const getNotificationContext = async (projectId, userId) => {
    let userEmail = null;
    let projectName = "Unknown Project";

    if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        userEmail = user[0]?.email;
    }

    if (projectId) {
        const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        projectName = project[0]?.name || "Unknown Project";
    }

    return { userEmail, projectName };
};

// Create a new task
exports.createTask = async (req, res, next) => {
    try {
        const { title, description, priority, status, dueDate, projectId } = req.body;
        const userId = req.user?.userId;

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

        const newTask = inserted[0];

        // Send email notification (async, don't wait)
        const { userEmail, projectName } = await getNotificationContext(projectId, userId);
        if (userEmail) {
            sendEmail(userEmail, "taskCreated", [newTask, projectName]);
        }

        res.status(201).json(newTask);
    } catch (err) {
        next(err);
    }
};

// Get all tasks (with optional filters)
exports.getAllTasks = async (req, res, next) => {
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
};

// Get single task by ID
exports.getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await db.select().from(tasks).where(eq(tasks.id, Number(id))).limit(1);
        if (!task[0]) return res.status(404).json({ error: "Task not found" });
        res.json(task[0]);
    } catch (err) {
        next(err);
    }
};

// Update task by ID
exports.updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, dueDate, projectId } = req.body;
        const userId = req.user?.userId;

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

        // Get current task for comparison
        const currentTask = await db.select().from(tasks).where(eq(tasks.id, Number(id))).limit(1);
        if (!currentTask[0]) return res.status(404).json({ error: "Task not found" });
        const oldTask = currentTask[0];

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

        const updatedTask = updated[0];

        // Send email notification
        const { userEmail, projectName } = await getNotificationContext(
            updatedTask.projectId || oldTask.projectId,
            userId
        );

        if (userEmail) {
            // Check if it's just a status change (common action)
            if (status && oldTask.status !== status && Object.keys(req.body).length <= 2) {
                sendEmail(userEmail, "taskStatusChanged", [updatedTask, projectName, oldTask.status, status]);
            } else {
                // General update - list what changed
                const changes = [];
                if (title && oldTask.title !== title) changes.push(`Title: "${oldTask.title}" → "${title}"`);
                if (description !== undefined && oldTask.description !== description) changes.push("Description updated");
                if (priority && oldTask.priority !== priority) changes.push(`Priority: ${oldTask.priority} → ${priority}`);
                if (status && oldTask.status !== status) changes.push(`Status: ${oldTask.status.replace('_', ' ')} → ${status.replace('_', ' ')}`);
                if (dueDate !== undefined && oldTask.dueDate !== (dueDate ? Number(dueDate) : null)) {
                    const oldDate = oldTask.dueDate ? new Date(oldTask.dueDate * 1000).toLocaleDateString() : "None";
                    const newDate = dueDate ? new Date(dueDate * 1000).toLocaleDateString() : "None";
                    changes.push(`Due Date: ${oldDate} → ${newDate}`);
                }

                if (changes.length > 0) {
                    sendEmail(userEmail, "taskUpdated", [updatedTask, projectName, changes]);
                }
            }
        }

        res.json(updatedTask);
    } catch (err) {
        next(err);
    }
};

// Delete task by ID
exports.deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        // Get task info before deleting
        const taskToDelete = await db.select().from(tasks).where(eq(tasks.id, Number(id))).limit(1);
        if (!taskToDelete[0]) return res.status(404).json({ error: "Task not found" });

        const taskInfo = taskToDelete[0];

        const deleted = await db.delete(tasks).where(eq(tasks.id, Number(id))).returning();

        // Send email notification
        const { userEmail, projectName } = await getNotificationContext(taskInfo.projectId, userId);
        if (userEmail) {
            sendEmail(userEmail, "taskDeleted", [taskInfo.title, projectName]);
        }

        res.json({ message: "Task deleted", task: deleted[0] });
    } catch (err) {
        next(err);
    }
};
