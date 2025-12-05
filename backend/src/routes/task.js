const express = require("express");
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
