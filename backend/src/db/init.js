const { db } = require("./db");
const { projects, tasks } = require("./schema");

// Create tables
async function createTables() {
    try {
        await db.run(projects.createTable());
        await db.run(tasks.createTable());
        console.log("Tables created successfully!");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
}

createTables();
