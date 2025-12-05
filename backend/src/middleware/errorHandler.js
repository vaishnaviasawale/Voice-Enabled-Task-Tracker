// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);
    console.error(err.stack);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle specific error types
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    if (err.code === "SQLITE_CONSTRAINT") {
        statusCode = 400;
        message = "Database constraint violation";
    }

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

module.exports = errorHandler;



