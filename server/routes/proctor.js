const express = require("express");
const { readJSON, writeJSON } = require("../db/jsonStore.js");

const router = express.Router();

// Generate unique code
const generateUniqueCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = Math.floor(Math.random() * 6) + 5; // 5-10 characters
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get all exam rooms
router.get("/exam-rooms", async (req, res) => {
  try {
    const data = await readJSON("examRooms.json");
    res.json(data);
  } catch (error) {
    console.error("Error fetching exam rooms:", error);
    res.json([]);
  }
});

// Create exam room
router.post("/exam-rooms", async (req, res) => {
  try {
    const { name, googleFormLink, examDuration, linkOpenDuration, createdBy, createdByName } =
      req.body;

    if (!name || !googleFormLink || !examDuration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const examRooms = await readJSON("examRooms.json");
    const uniqueCode = generateUniqueCode();

    const newRoom = {
      id: `room-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      googleFormLink,
      examDuration: parseInt(examDuration),
      linkOpenDuration: parseInt(linkOpenDuration) || 2,
      uniqueCode,
      createdBy,
      createdByName,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    examRooms.push(newRoom);
    await writeJSON("examRooms.json", examRooms);

    res.json({ ...newRoom, message: `Exam room created successfully! Room Code: ${uniqueCode}` });
  } catch (error) {
    console.error("Error creating exam room:", error);
    res.status(500).json({ message: "Failed to create exam room" });
  }
});

// Delete exam room (like Django - also deletes related students)
router.delete("/exam-rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const examRooms = await readJSON("examRooms.json");
    const filtered = examRooms.filter((room) => room.id !== id);
    await writeJSON("examRooms.json", filtered);
    
    // Delete related students (like Django exam_room.student_set.all().delete())
    const students = await readJSON("proctorStudents.json");
    const filteredStudents = students.filter((student) => student.examRoomId !== id);
    await writeJSON("proctorStudents.json", filteredStudents);
    
    res.json({ message: "Exam room deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam room:", error);
    res.status(500).json({ message: "Failed to delete exam room" });
  }
});

// Get all students
router.get("/students", async (req, res) => {
  try {
    const data = await readJSON("proctorStudents.json");
    res.json(data);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.json([]);
  }
});

// Join exam (monitor view - creates/validates student)
router.post("/join-exam", async (req, res) => {
  try {
    const { name, rollNumber, roomCode, guestId, guestName } = req.body;

    if (!name || !rollNumber || !roomCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const examRooms = await readJSON("examRooms.json");
    const examRoom = examRooms.find((room) => room.uniqueCode === roomCode);

    if (!examRoom) {
      return res.status(404).json({ message: "Invalid room code." });
    }

    const students = await readJSON("proctorStudents.json");

    // Check if student already exists
    const existingStudent = students.find(
      (s) => s.rollNumber === rollNumber && s.roomCode === roomCode
    );

    if (existingStudent && existingStudent.name !== name) {
      return res
        .status(400)
        .json({
          message:
            "A student with this roll number already exists in this exam room. Please use the same name.",
        });
    }

    let student;
    if (existingStudent) {
      // Use existing student
      student = existingStudent;
    } else {
      // Create new student record
      student = {
        id: `student-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        rollNumber,
        roomCode,
        examRoomId: examRoom.id,
        examRoomName: examRoom.name,
        guestId,
        guestName,
        startTime: new Date().toISOString(),
        endTime: null,
        date: new Date().toISOString(),
        score: null,
        warnings: 0,
        logs: [],
      };

      students.push(student);
      await writeJSON("proctorStudents.json", students);
    }

    // Return exam room and student info for starting exam
    res.json({
      examRoom: {
        ...examRoom,
        googleFormLink: examRoom.googleFormLink,
        examDuration: examRoom.examDuration,
      },
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        roomCode: student.roomCode,
      },
    });
  } catch (error) {
    console.error("Error joining exam:", error);
    res.status(500).json({ message: "Failed to join exam" });
  }
});

// Get exam details for starting (like Django start_exam view)
router.get("/start-exam/:roomCode/:rollNumber", async (req, res) => {
  try {
    const { roomCode, rollNumber } = req.params;

    const examRooms = await readJSON("examRooms.json");
    const examRoom = examRooms.find((room) => room.uniqueCode === roomCode);

    if (!examRoom) {
      return res.status(404).json({ message: "Exam room not found." });
    }

    const students = await readJSON("proctorStudents.json");
    const student = students.find(
      (s) => s.rollNumber === rollNumber && s.roomCode === roomCode
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json({
      roomCode,
      googleFormLink: examRoom.googleFormLink,
      rollNumber,
      examDuration: examRoom.examDuration,
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
      },
    });
  } catch (error) {
    console.error("Error getting exam details:", error);
    res.status(500).json({ message: "Failed to get exam details" });
  }
});

// End exam (like Django end_exam view)
router.post("/end-exam/:roomCode/:rollNumber", async (req, res) => {
  try {
    const { roomCode, rollNumber } = req.params;
    const { log } = req.body; // Django uses 'log' parameter

    let logs = [];
    if (log) {
      try {
        // Parse logs from JSON string (like Django)
        logs = typeof log === 'string' ? JSON.parse(log) : log;
      } catch (e) {
        logs = Array.isArray(log) ? log : [];
      }
    }

    const students = await readJSON("proctorStudents.json");
    const student = students.find(
      (s) => s.rollNumber === rollNumber && s.roomCode === roomCode
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Update student record
    student.endTime = new Date().toISOString();
    student.logs = logs;
    student.warnings = logs.length;

    await writeJSON("proctorStudents.json", students);

    res.json({ message: "Exam ended successfully", student });
  } catch (error) {
    console.error("Error ending exam:", error);
    res.status(500).json({ message: `An error occurred: ${error.message}` });
  }
});

// Get student logs (like Django get_student_logs)
router.get("/logs", async (req, res) => {
  try {
    const studentName = req.query.studentName;

    if (!studentName) {
      return res.status(400).json({ error: "No student name provided" });
    }

    const students = await readJSON("proctorStudents.json");
    const student = students.find((s) => s.name === studentName);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ logs: student.logs || [] });
  } catch (error) {
    console.error("Error getting student logs:", error);
    res.status(500).json({ error: "Failed to get student logs" });
  }
});

module.exports = router;

