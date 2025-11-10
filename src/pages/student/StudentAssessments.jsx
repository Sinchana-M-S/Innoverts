import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      // Fetch enrolled courses first, then get assessments for each
      const { data: user } = await api.get('/auth/me');
      const courseIds = user.enrolledCourses || [];
      
      const allAssessments = [];
      for (const courseId of courseIds) {
        try {
          const { data } = await api.get(`/assessments/course/${courseId}`);
          allAssessments.push(...data);
        } catch (error) {
          console.error(`Failed to fetch assessments for course ${courseId}:`, error);
        }
      }
      
      setAssessments(allAssessments);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/assessments/${selectedAssessment._id}/submit`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      });
      toast.success(`Assessment submitted! You earned ${data.creditsEarned} credits!`);
      setSelectedAssessment(null);
      setAnswers({});
      fetchAssessments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-white">AI Assessments</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-900" />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-xl text-gray-600 dark:text-gray-400">No assessments available</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Enroll in courses to see assessments
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, index) => {
              const userSubmission = assessment.submissions?.find(
                (s) => s.userId === JSON.parse(localStorage.getItem('user'))?.id
              );

              return (
                <motion.div
                  key={assessment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <ClipboardList className="text-blue-500 dark:text-blue-400" size={24} />
                            <h3 className="text-xl font-bold text-black dark:text-white">{assessment.title}</h3>
                            <span className="rounded-full bg-gray-200 dark:bg-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 capitalize">
                              {assessment.type}
                            </span>
                          </div>
                          {assessment.description && (
                            <p className="mb-4 text-gray-600 dark:text-gray-400">{assessment.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock size={16} />
                              <span>
                                {assessment.dueDate
                                  ? `Due: ${formatDate(assessment.dueDate)}`
                                  : 'No due date'}
                              </span>
                            </div>
                            <span>{assessment.totalPoints} points</span>
                          </div>
                          {userSubmission && (
                            <div className="mt-4 flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <CheckCircle size={18} />
                              <span>Submitted - Score: {userSubmission.score}/{assessment.totalPoints}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => setSelectedAssessment(assessment)}
                          disabled={!!userSubmission}
                        >
                          {userSubmission ? 'Completed' : 'Take Assessment'}
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

      {/* Assessment Modal */}
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
                  <span className="font-bold text-black dark:text-white">{qIndex + 1}.</span>
                  <div className="flex-1">
                    <p className="mb-2 text-black dark:text-white">{question.question}</p>
                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options?.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className="flex cursor-pointer items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={option}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [qIndex]: e.target.value,
                                })
                              }
                              className="text-black dark:text-white"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {question.type === 'true-false' && (
                      <div className="space-y-2">
                        {['True', 'False'].map((option) => (
                          <label
                            key={option}
                            className="flex cursor-pointer items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={option}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [qIndex]: e.target.value,
                                })
                              }
                              className="text-black dark:text-white"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {question.type === 'fill-blank' && (
                      <input
                        type="text"
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [qIndex]: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                        placeholder="Enter your answer"
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
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

