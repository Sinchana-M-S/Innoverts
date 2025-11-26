import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Clock, CheckCircle, Video } from "lucide-react";
import api from "../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { formatDate } from "../../lib/utils";
import toast from "react-hot-toast";

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Guest identity since no login system
  const guestId =
    localStorage.getItem("guestId") ||
    `g-${Math.random().toString(36).slice(2)}`;
  const guestName =
    localStorage.getItem("guestName") ||
    `Guest-${Math.floor(Math.random() * 9000 + 1000)}`;

  useEffect(() => {
    localStorage.setItem("guestId", guestId);
    localStorage.setItem("guestName", guestName);
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      // ✅ Guest mode → just fetch ALL assessments from backend
      const { data } = await api.get("/assessments");
      setAssessments(data || []);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = {
        guestId,
        guestName,
        answers: Object.entries(answers).map(([questionIndex, answer]) => ({
          index: parseInt(questionIndex),
          answer,
        })),
      };

      await api.post(`/assessments/${selectedAssessment.id}/submit`, payload);

      toast.success("Assessment submitted!");
      setSelectedAssessment(null);
      setAnswers({});
      fetchAssessments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            AI Assessments
          </h1>
          <Button
            variant="primary"
            onClick={() => {
              // Open ProctorAI Django app in new tab
              window.open("http://localhost:8000/", "_blank");
            }}
            className="flex items-center space-x-2"
          >
            <Video size={20} />
            <span>Click on Proctored Assessment</span>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-900"
              />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList
                size={64}
                className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
              />
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No assessments available
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, index) => {
              // ✅ Check if guest already submitted
              const userSubmission = assessment.submissions?.find(
                (s) => s.guestId === guestId
              );

              return (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <ClipboardList
                              className="text-blue-500 dark:text-blue-400"
                              size={24}
                            />
                            <h3 className="text-xl font-bold text-black dark:text-white">
                              {assessment.title}
                            </h3>
                            <span className="rounded-full bg-gray-200 dark:bg-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 capitalize">
                              {assessment.type}
                            </span>
                          </div>

                          <p className="mb-4 text-gray-600 dark:text-gray-400">
                            {assessment.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock size={16} />
                              <span>
                                {assessment.dueDate
                                  ? `Due: ${formatDate(assessment.dueDate)}`
                                  : "No due date"}
                              </span>
                            </div>
                            <span>{assessment.totalPoints} points</span>
                          </div>

                          {userSubmission && (
                            <div className="mt-4 flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <CheckCircle size={18} />
                              <span>
                                Submitted — Score: {userSubmission.score}/
                                {assessment.totalPoints}
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          onClick={() => setSelectedAssessment(assessment)}
                          disabled={!!userSubmission}
                        >
                          {userSubmission ? "Completed" : "Take Assessment"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Assessment Modal */}
      <Modal
        isOpen={!!selectedAssessment}
        onClose={() => {
          setSelectedAssessment(null);
          setAnswers({});
        }}
        title={selectedAssessment?.title}
        className="max-w-3xl"
      >
        {selectedAssessment && (
          <div className="space-y-6">
            {selectedAssessment.questions?.map((question, qIndex) => (
              <div key={qIndex} className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-black dark:text-white">
                    {qIndex + 1}.
                  </span>

                  <div className="flex-1">
                    <p className="mb-2 text-black dark:text-white">
                      {question.question}
                    </p>

                    {/* ✅ Multiple Choice */}
                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        {question.options?.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              value={option}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [qIndex]: e.target.value,
                                })
                              }
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* ✅ True/False */}
                    {question.type === "true-false" && (
                      <div className="space-y-2">
                        {["True", "False"].map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              value={option}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [qIndex]: e.target.value,
                                })
                              }
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* ✅ Fill in the blank */}
                    {question.type === "fill-blank" && (
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [qIndex]: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-800 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedAssessment(null);
                  setAnswers({});
                }}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
