const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../db/jsonStore.js");
const { v4: uuid } = require("uuid");

// ✅ Get all courses (supports optional `search` and `category` query params)
router.get("/", async (req, res) => {
  const courses = await readJSON("courses.json");

  try {
    let results = courses || [];
    const { search, category } = req.query || {};

    if (category) {
      const cat = String(category).toLowerCase();
      results = results.filter((c) => (c.category || "").toLowerCase() === cat);
    }

    if (search) {
      const q = String(search).toLowerCase();
      results = results.filter((c) => {
        const title = (c.title || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        const inst = (c.instructorName || "").toLowerCase();
        const tags = (c.tags || []).join(" ").toLowerCase();
        return title.includes(q) || desc.includes(q) || inst.includes(q) || tags.includes(q);
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Failed to filter courses:", err);
    res.status(500).json(courses || []);
  }
});

// ✅ Get single course
router.get("/:id", async (req, res) => {
  const courses = await readJSON("courses.json");
  const course = courses.find((c) => c._id === req.params.id);
  res.json(course || null);
});

// ✅ Enroll (guest only)
router.post("/:id/enroll", async (req, res) => {
  const users = await readJSON("users.json");
  const courses = await readJSON("courses.json");

  const user = users.find((u) => u.role === "guest");
  const course = courses.find((c) => c._id === req.params.id);

  if (!course) return res.status(404).json({ message: "Course not found" });

  if (!user.enrolledCourses) {
    user.enrolledCourses = [];
  }
  if (!user.enrolledCourses.includes(req.params.id)) {
    user.enrolledCourses.push(req.params.id);
  }

  await writeJSON("users.json", users);
  res.json({ message: "Enrolled" });
});

module.exports = router;
