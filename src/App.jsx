import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import StudentCourses from './pages/student/StudentCourses';
import StudentCredits from './pages/student/StudentCredits';
import StudentCompleted from './pages/student/StudentCompleted';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentSummarizer from './pages/student/StudentSummarizer';
import StudentChat from './pages/student/StudentChat';
import StudentAssessments from './pages/student/StudentAssessments';
import InstructorUpload from './pages/instructor/InstructorUpload';
import InstructorLiveClasses from './pages/instructor/InstructorLiveClasses';
import InstructorCredits from './pages/instructor/InstructorCredits';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import Profile from './pages/Profile';
import FloatingChatbot from './components/FloatingChatbot';
import Footer from './components/Footer';

function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireRole) {
    const hasRole = user?.role === requireRole || user?.role === 'both';
    if (!hasRole) {
      return <Navigate to="/" />;
    }
  }

  return children;
}

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const savedTheme = parsed.state?.theme || 'dark';
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(savedTheme);
      } catch (e) {
        document.documentElement.classList.add('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route
              path="/course/:id/play"
              element={
                <ProtectedRoute>
                  <CoursePlayer />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/credits"
              element={
                <ProtectedRoute>
                  <StudentCredits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/completed"
              element={
                <ProtectedRoute>
                  <StudentCompleted />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/documents"
              element={
                <ProtectedRoute>
                  <StudentDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/summarizer"
              element={
                <ProtectedRoute>
                  <StudentSummarizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/chat"
              element={
                <ProtectedRoute>
                  <StudentChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assessments"
              element={
                <ProtectedRoute>
                  <StudentAssessments />
                </ProtectedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/instructor/upload"
              element={
                <ProtectedRoute requireRole="instructor">
                  <InstructorUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/live-classes"
              element={
                <ProtectedRoute requireRole="instructor">
                  <InstructorLiveClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/credits"
              element={
                <ProtectedRoute requireRole="instructor">
                  <InstructorCredits />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Floating Chatbot - Only for authenticated students */}
        <FloatingChatbot />


        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--toast-bg, #1f1f1f)',
              color: 'var(--toast-color, #fff)',
              border: '1px solid var(--toast-border, #333)',
            },
            className: 'dark:bg-gray-900 dark:text-white bg-white dark:text-white',
          }}
        />
      </div>
    </Router>
  );
}

export default App;
