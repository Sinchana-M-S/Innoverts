import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, ArrowLeft } from "lucide-react";
import api from "../../lib/api";
import { Card, CardContent } from "../../components/ui/Card";
import { CourseCardSkeleton } from "../../components/ui/Skeleton";
import { dummyCourses } from "../../data/dummyData";
import { normalizeCourse } from "../../lib/utils";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("all");
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // ✅ Guest identity
  const guestId =
    localStorage.getItem("guestId") ||
    `g-${Math.random().toString(36).substring(2, 10)}`;

  useEffect(() => {
    localStorage.setItem("guestId", guestId);
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      // ✅ GET enrolled course IDs from backend
      const { data } = await api.get(`/api/students/${guestId}/enrolled`);

      if (!data || data.length === 0) {
        setCourses(dummyCourses.slice(0, 3).map(normalizeCourse));
        return;
      }

      // Fetch details for each course
      const courseData = await Promise.all(
        data.map((courseId) =>
          api
            .get(`/api/courses/${courseId}`)
            .then((res) => normalizeCourse(res.data))
            .catch(() => {
              const fallback =
                dummyCourses.find(
                  (course) => course.id === courseId || course._id === courseId
                ) || dummyCourses[0];
              return normalizeCourse(fallback);
            })
        )
      );

      setCourses(courseData.filter(Boolean));
    } catch (error) {
      console.error("Failed to load user courses:", error);
      setCourses(dummyCourses.slice(0, 3).map(normalizeCourse)); // fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses =
    view === "all"
      ? courses
      : courses.filter((course) =>
          view === "in-progress"
            ? (course.progress ?? 30) < 100
            : (course.progress ?? 30) === 100
        );

  const completedCount = courses.filter(
    (course) => (course.progress ?? 30) === 100
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-wider text-blue-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-bold text-black dark:text-white">
              My Courses
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
              Dive back into your learning journey. We’re fetching the courses
              you’re enrolled in.
            </p>
          </div>
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
        <header className="mb-10 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-[1px]">
          <div className="rounded-3xl bg-white dark:bg-black p-8 md:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={goBack}
                className="inline-flex items-center space-x-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <p className="text-sm uppercase tracking-wider text-blue-500">
                Student Dashboard
              </p>
            </div>
            <h1 className="mt-4 text-4xl font-bold text-black dark:text-white">
              Your Learning Path
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
              Continue where you left off, explore new lessons, and track your
              mastery across every subject you care about.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Card className="border-none bg-gray-100 dark:bg-gray-900">
                <CardContent className="p-6">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Active Courses
                  </span>
                  <p className="mt-2 text-3xl font-semibold text-black dark:text-white">
                    {courses.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Courses you’re currently enrolled in.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-gray-100 dark:bg-gray-900">
                <CardContent className="p-6">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Completed
                  </span>
                  <p className="mt-2 text-3xl font-semibold text-black dark:text-white">
                    {completedCount}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Keep up the momentum!
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-gray-100 dark:bg-gray-900">
                <CardContent className="p-6">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Daily Goal
                  </span>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Watch at least 15 minutes of content today to maintain your
                    streak.
                  </p>
                  <Link
                    to="/student/summarizer"
                    className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Review today’s notes →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Continue Learning
          </h2>
          <div className="flex items-center space-x-2 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 p-1">
            {[
              { key: "all", label: "All" },
              { key: "in-progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setView(option.key)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  view === option.key
                    ? "bg-white dark:bg-black text-black dark:text-white shadow"
                    : "text-gray-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <p className="text-xl font-semibold text-black dark:text-white">
                No courses to show here yet.
              </p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Explore new learning paths and enroll to unlock personalized
                progress tracking.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Browse Courses
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course, index) => {
              const totalVideos = course.videos?.length || 0;
              const durationMinutes = Math.round(
                (course.videos || []).reduce(
                  (sum, video) => sum + (video.duration || 0),
                  0
                ) / 60
              );
              const progress = course.progress ?? ((index + 1) * 12) % 90;

              return (
                <motion.div
                  key={course.id || course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-gray-800">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Play size={48} className="text-gray-500" />
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow">
                        {course.category || "Course"}
                      </div>
                    </div>

                    <CardContent className="space-y-4 p-6">
                      <div>
                        <h3 className="line-clamp-2 text-lg font-semibold text-black dark:text-white">
                          {course.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
                        <span>{totalVideos} lessons</span>
                        <span>{durationMinutes} min</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Progress</span>
                          <span>{Math.min(progress, 100)}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Link
                          to={`/course/${course.id || course._id}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                        >
                          View details
                        </Link>
                        <Link
                          to={`/course/${course.id || course._id}/play`}
                          className="inline-flex items-center space-x-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                          <Play size={16} />
                          <span>Resume</span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
