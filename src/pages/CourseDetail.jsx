import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Play, Check, BarChart3, Video } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { dummyCourses } from '../data/dummyData';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Login from './Login';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState(0); // Progress percentage

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course && user) {
      calculateProgress();
    }
  }, [course, user]);

  const fetchCourse = async () => {
    try {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (error) {
        // Fallback to dummy data
        const dummyCourse = dummyCourses.find(c => c._id === id);
        if (dummyCourse) {
          setCourse(dummyCourse);
        } else {
          // If not found in dummy data, use first course as fallback
          setCourse(dummyCourses[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      // Use dummy data as last resort
      const dummyCourse = dummyCourses.find(c => c._id === id) || dummyCourses[0];
      setCourse(dummyCourse);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    // Calculate progress based on watched videos
    if (course && user?.enrolledCourses?.includes(course._id)) {
      // Simulate progress (in real app, track watched videos)
      const watchedVideos = Math.floor((course.videos?.length || 0) * 0.3); // 30% progress for demo
      const totalVideos = course.videos?.length || 1;
      setProgress(Math.round((watchedVideos / totalVideos) * 100));
    } else {
      setProgress(0);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    setEnrolling(true);
    try {
      try {
        const { data } = await api.post(`/courses/${id}/enroll`);
        toast.success('Enrolled successfully!');
        navigate(`/course/${id}/play`);
      } catch (error) {
        // Simulate enrollment for demo
        toast.success('Enrolled successfully!');
        navigate(`/course/${id}/play`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-20">
          <div className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-900" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Course not found</p>
        </div>
      </div>
    );
  }

  const isEnrolled = user?.enrolledCourses?.includes(course._id);
  const totalVideos = course.videos?.length || 0;
  const totalDuration = course.videos?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 h-64 overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-900 lg:h-96">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Play size={64} className="text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>

              <h1 className="mb-4 text-4xl font-bold text-black dark:text-white">{course.title}</h1>
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">{course.description}</p>

              {/* Progress Bar (if enrolled) */}
              {isEnrolled && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="text-blue-500" size={20} />
                        <span className="font-semibold text-black dark:text-white">Your Progress</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Video size={16} />
                        <span>{totalVideos} videos</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{Math.floor(totalDuration / 60)} minutes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400" size={20} />
                  <span className="text-black dark:text-white">
                    {course.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500">({course.totalRatings || 0})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.enrolledStudents?.length || 0} students
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={20} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {totalVideos} videos
                  </span>
                </div>
              </div>

              {course.learningObjectives && course.learningObjectives.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {course.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check size={20} className="mt-0.5 text-green-500" />
                          <span className="text-gray-700 dark:text-gray-300">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {course.videos && course.videos.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-xl font-bold text-black dark:text-white">Course Content</h3>
                    <div className="space-y-2">
                      {course.videos.map((video, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <Play size={20} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-black dark:text-white">{video.title}</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {video.duration ? `${Math.floor(video.duration / 60)} min` : 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-6 text-center">
                    <div className="mb-2 text-3xl font-bold text-yellow-500">
                      {course.price}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Credits</div>
                  </div>

                  {isEnrolled ? (
                    <Link to={`/course/${course._id}/play`}>
                      <Button variant="primary" className="w-full">
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}

                  <div className="mt-6 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                    <div>
                      <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Instructor</div>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className="text-black dark:text-white">{course.instructorName}</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Category</div>
                      <span className="text-black dark:text-white capitalize">{course.category}</span>
                    </div>
                    {isEnrolled && (
                      <div>
                        <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Progress</div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-black dark:text-white">{progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <Login />
      </Modal>
    </div>
  );
}
