// src/db/schema.js
const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

// Enums as strings
const Priority = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
};

const Status = {
    TODO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
};

// Users table
const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password").notNull(), // Hashed password
    name: text("name").notNull(),
    createdAt: integer("created_at").default(Math.floor(Date.now() / 1000)),
});

// Projects table (now with userId)
const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description").default(""),
    userId: integer("user_id").references(() => users.id).notNull(),
    createdAt: integer("created_at").default(Math.floor(Date.now() / 1000)),
});

// Tasks table
const tasks = sqliteTable("tasks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").default(""),
    priority: text("priority").default(Priority.MEDIUM),
    status: text("status").default(Status.TODO),
    dueDate: integer("due_date"), // Unix timestamp, null if not set
    projectId: integer("project_id").references(() => projects.id),
    createdAt: integer("created_at").default(Math.floor(Date.now() / 1000)),
    updatedAt: integer("updated_at").default(Math.floor(Date.now() / 1000)),
});

module.exports = {
    Priority,
    Status,
    users,
    projects,
    tasks,
};
