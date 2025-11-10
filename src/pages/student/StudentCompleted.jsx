import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Award, CreditCard } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function StudentCompleted() {
  const { user, fetchUser } = useAuthStore();
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedCourses();
    fetchUser();
  }, []);

  const fetchCompletedCourses = async () => {
    try {
      if (user?.completedCourses) {
        const courses = await Promise.all(
          user.completedCourses.map(async (completed) => {
            try {
              const { data } = await api.get(`/courses/${completed.courseId}`);
              return { ...completed, course: data };
            } catch (error) {
              return { ...completed, course: null };
            }
          })
        );
        setCompletedCourses(courses);
      }
    } catch (error) {
      console.error('Failed to fetch completed courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (completed) => {
    // In production, generate and download PDF certificate
    toast.success('Certificate download started!');
    // Simulate download
    const link = document.createElement('a');
    link.href = completed.certificateUrl || '#';
    link.download = `certificate-${completed.courseId}.pdf`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-white">Completed Courses</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-900" />
            ))}
          </div>
        ) : completedCourses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-xl text-gray-600 dark:text-gray-400">No completed courses yet</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Complete courses to earn credits and certificates!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {completedCourses.map((completed, index) => (
              <motion.div
                key={completed.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 text-2xl font-bold text-black dark:text-white">
                          {completed.course?.title || 'Course'}
                        </h3>
                        <div className="mb-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Award className="text-yellow-500 dark:text-yellow-400" size={16} />
                            <span>Certificate Available</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CreditCard className="text-green-600 dark:text-green-400" size={16} />
                            <span>+{completed.creditsEarned} credits earned</span>
                          </div>
                          <span>Completed on {formatDate(completed.completedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadCertificate(completed)}
                        className="flex items-center space-x-2 rounded-lg bg-black dark:bg-white px-4 py-2 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                      >
                        <Download size={18} />
                        <span>Download Certificate</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

