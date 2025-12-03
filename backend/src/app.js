// backend/src/app.js
const express = require('express')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Project routes
const projectRoutes = require('./routes/project');
app.use('/projects', projectRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Voice-Enabled Task Tracker Backend is running')
})

// 404 handler
app.use((req, res, next) => {
    res.status(404).send({ error: 'Not found' })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({ error: 'Something went wrong!' })
})

module.exports = app
