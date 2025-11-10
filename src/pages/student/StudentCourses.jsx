import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { formatTime } from '../../lib/utils';
import { dummyCourses } from '../../data/dummyData';

export default function StudentCourses() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const enrolledIds = user?.enrolledCourses || [];
      if (enrolledIds.length === 0) {
        // Use dummy data if no enrolled courses
        setCourses(dummyCourses.slice(0, 2));
        setLoading(false);
        return;
      }
      try {
        const allCourses = await Promise.all(
          enrolledIds.map((id) => api.get(`/courses/${id}`).then((res) => res.data))
        );
        setCourses(allCourses);
      } catch (error) {
        // Fallback to dummy data
        setCourses(dummyCourses.slice(0, 2));
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses(dummyCourses.slice(0, 2));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-20">
          <h1 className="mb-8 text-4xl font-bold text-black dark:text-white">My Courses</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-white">My Courses</h1>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-400">No enrolled courses yet</p>
              <Link
                to="/"
                className="mt-4 inline-block text-white underline hover:text-gray-400"
              >
                Browse Courses
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                  <Link to={`/course/${course._id}/play`}>
                  <Card className="h-full cursor-pointer transition-all hover:scale-105">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-800">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Play size={48} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 line-clamp-2 text-lg font-bold text-black dark:text-white">
                        {course.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{course.videos?.length || 0} videos</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

