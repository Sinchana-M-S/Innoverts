const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../db/jsonStore.js");
const { v4: uuid } = require("uuid");

// ✅ Get all users (for admin purposes, or specific user data)
router.get("/", async (req, res) => {
  const users = await readJSON("users.json");
  res.json(users);
});

// ✅ Get single user by ID
router.get("/:id", async (req, res) => {
  const users = await readJSON("users.json");
  const user = users.find((u) => u._id === req.params.id);
  res.json(user || null);
});

// ✅ Complete course (for guest user)
router.post("/:guestId/complete-course", async (req, res) => {
  const { courseId } = req.body;
  const users = await readJSON("users.json");

  // Find the guest user (or by guestId if provided)
  const user = users.find((u) => u.role === "guest"); // Assuming a single guest user for simplicity

  if (!user) {
    return res.status(404).json({ message: "Guest user not found" });
  }

  if (!user.completedCourses) {
    user.completedCourses = [];
  }
  if (!user.completedCourses.includes(courseId)) {
    user.completedCourses.push(courseId);
    user.credits = (user.credits || 0) + 50; // Add 50 credits
  }

  await writeJSON("users.json", users);
  res.json({ message: "Course completed and credits added" });
});

module.exports = router;
