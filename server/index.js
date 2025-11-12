const express = require("express");
const cors = require("cors");
const path = require("path");

// ✅ Routes
const authRoutes = require("./routes/auth.js");
const coursesRoutes = require("./routes/courses.js");
const creditsRoutes = require("./routes/credits.js");
const chatRoutes = require("./routes/chat.js");
const documentsRoutes = require("./routes/documents.js");
const assessmentsRoutes = require("./routes/assessments.js");
const liveClassesRoutes = require("./routes/liveClasses.js");
const usersRoutes = require("./routes/users.js");

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Register routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/assessments", assessmentsRoutes);
app.use("/api/live-classes", liveClassesRoutes);
app.use("/api/users", usersRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Sarvasva Backend Running (CommonJS)");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
