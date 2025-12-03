// src/db/db.js
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");

const sqlite = new Database("src/db/dev.db"); // path relative to backend
const db = drizzle(sqlite);

module.exports = { db };
