const express = require("express");
const { readJSON, writeJSON } = require("../db/jsonStore.js");

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await readJSON("assessments.json");
  res.json(data);
});

router.post("/:id/submit", async (req, res) => {
  try {
    const { id } = req.params;
    const { guestId, guestName, answers, proctorLogs } = req.body;

    if (!guestId || !guestName || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const assessments = await readJSON("assessments.json");
    const assessment = assessments.find((a) => a.id === id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if already submitted
    const existingSubmission = assessment.submissions?.find(
      (s) => s.guestId === guestId
    );

    if (existingSubmission) {
      return res.status(400).json({ message: "Assessment already submitted" });
    }

    // Calculate score
    let score = 0;
    assessment.questions?.forEach((question, index) => {
      const userAnswer = answers.find((a) => a.index === index)?.answer;
      if (userAnswer && question.correctAnswer) {
        if (question.type === "multiple-choice" || question.type === "true-false") {
          if (userAnswer === question.correctAnswer) {
            score += question.points || 1;
          }
        } else if (question.type === "fill-blank") {
          // Case-insensitive comparison for fill-in-the-blank
          if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            score += question.points || 1;
          }
        }
      }
    });

    // Create submission
    const submission = {
      guestId,
      guestName,
      answers,
      score,
      submittedAt: new Date().toISOString(),
      proctorLogs: proctorLogs || [], // Include ProctorAI logs
    };

    // Add submission to assessment
    if (!assessment.submissions) {
      assessment.submissions = [];
    }
    assessment.submissions.push(submission);

    // Save updated assessments
    await writeJSON("assessments.json", assessments);

    res.json({
      message: "Assessment submitted successfully",
      score,
      totalPoints: assessment.totalPoints,
      submission,
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ message: "Failed to submit assessment" });
  }
});

module.exports = router;
