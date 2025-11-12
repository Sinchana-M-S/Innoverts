import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Users,
  Play,
  Check,
  BarChart3,
  Video,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import useAuthStore from "../store/authStore";
import { dummyCourses } from "../data/dummyData";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { normalizeCourse } from "../lib/utils";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, fetchUser, openLoginModal } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchUser();
  }, [id, fetchUser]);

  useEffect(() => {
    if (course && user) calculateProgress();
  }, [course, user]);

  // ✅ JSON-Backend Course Fetch
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/courses/${id}`);
      const normalized = normalizeCourse(data);
      if (normalized) {
        setCourse(normalized);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log("API fetch failed, using fallback:", error);
    }

    // Fallback to dummy data
    const fallback =
      dummyCourses.find((c) => c.id === id || c._id === id) || dummyCourses[0];
    setCourse(normalizeCourse(fallback));
    setLoading(false);
  };

  // ✅ Progress (JSON backend has no watched data → simulate)
  const calculateProgress = () => {
    const normalizedCourseId = course?.id || course?._id || id;

    if (
      !course ||
      !normalizedCourseId ||
      !user?.enrolledCourses?.includes(normalizedCourseId)
    ) {
      setProgress(0);
      return;
    }

    const total = course.videos?.length || 1;
    const watched = Math.floor(total * 0.3); // 30% demo
    setProgress(Math.round((watched / total) * 100));
  };

  // ✅ JSON Backend Enrollment
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setEnrolling(true);

    try {
      await api.post(`/api/courses/${id}/enroll`);
      toast.success("Enrolled successfully!");

      // ✅ Update frontend auth store
      fetchUser();

      navigate(`/course/${id}/play`);
    } catch (error) {
      toast.success("Enrolled (Demo Mode)");
      navigate(`/course/${id}/play`);
    } finally {
      setEnrolling(false);
    }
  };

  // ✅ Loading fallback
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
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Course not found
          </p>
        </div>
      </div>
    );
  }

  // ✅ JSON Backend Fields
  const enrolledIds = user?.enrolledCourses || [];
  const courseId = course.id || course._id || id;
  const isEnrolled =
    enrolledIds.includes(courseId) ||
    enrolledIds.includes(course._id) ||
    enrolledIds.includes(course.id);
  const totalVideos = course.videos?.length || 0;
  const totalDuration =
    course.videos?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center space-x-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left side content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Banner */}
              <div className="mb-6 h-64 overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-900 lg:h-96">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Play size={64} className="text-gray-400" />
                  </div>
                )}
              </div>

              <h1 className="mb-4 text-4xl font-bold text-black dark:text-white">
                {course.title}
              </h1>
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                {course.description}
              </p>

              {/* ✅ Progress for JSON backend */}
              {isEnrolled && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BarChart3 size={20} className="text-blue-500" />
                        <span className="font-semibold">Your Progress</span>
                      </div>
                      <span>{progress}%</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800">
                      <div
                        className="h-3 bg-blue-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
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

              {/* Stats */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-900 px-4 py-2">
                  <Star className="text-yellow-400" size={20} />
                  <span className="font-semibold">
                    {Number(course.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({course.totalRatings || 0} ratings)
                  </span>
                </div>

                <div className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-900 px-4 py-2">
                  <Users size={20} className="text-gray-500" />
                  <span className="font-semibold">
                    {course.totalStudents || 0}
                  </span>
                  <span className="text-sm text-gray-500">students</span>
                </div>

                <div className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-900 px-4 py-2">
                  <Clock size={20} className="text-gray-500" />
                  <span className="font-semibold">{totalVideos}</span>
                  <span className="text-sm text-gray-500">videos</span>
                </div>
              </div>

              {/* Objectives */}
              {course.learningObjectives?.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {course.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check size={18} className="mt-1 text-green-500" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Videos */}
              {totalVideos > 0 && (
                <Card className="border border-gray-200 dark:border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
                      Course Content
                    </h3>
                    <div className="space-y-2">
                      {course.videos.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {i + 1}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Play size={18} className="text-gray-500" />
                              <span className="font-medium text-black dark:text-white">
                                {v.title}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.floor((Number(v.duration) || 0) / 60)} min
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
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="sticky top-24 border border-gray-200 dark:border-gray-800 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-yellow-500 mb-1">
                      {course.price || "Free"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {course.price ? "Credits" : "No payment required"}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Instructor
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        {course.instructorName || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Category
                      </span>
                      <span className="font-semibold text-black dark:text-white capitalize">
                        {course.category || "General"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Duration
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        {Math.floor(totalDuration / 60)} min
                      </span>
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Link to={`/course/${courseId}/play`}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
