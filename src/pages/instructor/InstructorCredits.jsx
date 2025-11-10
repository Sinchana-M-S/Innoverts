import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatDate } from '../../lib/utils';

export default function InstructorCredits() {
  const { user, fetchUser } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorCourses();
    fetchUser();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      if (user?.createdCourses) {
        const courseData = await Promise.all(
          user.createdCourses.map((id) =>
            api.get(`/courses/${id}`).then((res) => res.data)
          )
        );
        setCourses(courseData);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = courses.reduce(
    (sum, course) => sum + course.price * (course.enrolledStudents?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-white">Credits Earned</h1>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2 text-sm text-gray-400">Total Credits Earned</p>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="text-yellow-400" size={32} />
                    <span className="text-5xl font-bold text-white">{totalEarnings}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Courses Created</p>
                  <p className="text-2xl font-bold text-white">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-900" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
                <p className="text-xl text-gray-400">No courses created yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  Create courses to start earning credits!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course, index) => {
                  const earnings = course.price * (course.enrolledStudents?.length || 0);
                  return (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                          <BookOpen className="text-gray-400" size={24} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{course.title}</p>
                          <p className="text-sm text-gray-400">
                            {course.enrolledStudents?.length || 0} enrollments
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="text-green-400" size={20} />
                          <span className="text-xl font-bold text-green-400">{earnings}</span>
                          <span className="text-sm text-gray-400">credits</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {course.price} credits per enrollment
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

