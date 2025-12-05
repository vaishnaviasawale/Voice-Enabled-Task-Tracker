const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, email }

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." });
        }
        return res.status(401).json({ error: "Authentication failed." });
    }
};

module.exports = authenticate;



