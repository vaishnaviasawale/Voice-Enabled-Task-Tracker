// backend/src/app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');
const voiceRoutes = require('./routes/voice');

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/voice', voiceRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Voice-Enabled Task Tracker Backend is running');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
