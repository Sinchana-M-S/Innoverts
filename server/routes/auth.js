const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../db/jsonStore.js");
const { v4: uuid } = require("uuid");

// ✅ Get guest profile
router.get("/profile", async (req, res) => {
  const users = await readJSON("users.json");

  let guest = users.find((u) => u.role === "guest");

  if (!guest) {
    guest = {
      _id: uuid(), // Changed to _id
      role: "guest",
      name: "Guest User",
      email: "guest@sarvasva.com",
      credits: 0,
      skills: [],
      bio: "",
      completedCourses: [],
      enrolledCourses: [], // Added enrolledCourses for consistency
      createdCourses: []
    };
    users.push(guest);
    await writeJSON("users.json", users);
  }

  res.json(guest);
});

// ✅ Update guest profile
router.put("/profile", async (req, res) => {
  const users = await readJSON("users.json");
  let guest = users.find((u) => u.role === "guest");

  guest = { ...guest, ...req.body };

  const index = users.findIndex((u) => u._id === guest._id); // Changed to _id
  users[index] = guest;

  await writeJSON("users.json", users);
  res.json(guest);
});

// ✅ Login endpoint
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  const users = await readJSON("users.json");

  const user = users.find(
    (u) => u.email === email && u.password === password && u.role === role
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json(user);
});

module.exports = router;
