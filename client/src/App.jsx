import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useThemeStore from './store/themeStore';
import useAuthStore from './store/authStore'; // Import auth store
import Navbar from './components/Navbar';
import Login from './components/Login'; // Import Login component
import Modal from './components/ui/Modal';

// Pages
import Home from './pages/Home';
import StudentCourses from './pages/student/StudentCourses';
import StudentCredits from './pages/student/StudentCredits';
import StudentCompleted from './pages/student/StudentCompleted';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentSummarizer from './pages/student/StudentSummarizer';
import StudentChat from './pages/student/StudentChat';
import StudentAssessments from './pages/student/StudentAssessments';
import ProctorAI from './pages/student/ProctorAI';
import InstructorUpload from './pages/instructor/InstructorUpload';
import InstructorLiveClasses from './pages/instructor/InstructorLiveClasses';
import InstructorCredits from './pages/instructor/InstructorCredits';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import Profile from './pages/Profile';
import FloatingChatbot from './components/FloatingChatbot';
import Footer from './components/Footer';
import AI from './pages/AI';

function App() {
  const { theme } = useThemeStore();
  const {
    user,
    isAuthenticated,
    fetchUser,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
  } = useAuthStore(); // Get user and isAuthenticated

  // ✅ Theme handling stays same
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
      } catch (err) {
        document.documentElement.classList.add('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch user on app load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Private Route Component
  const PrivateRoute = ({ children, allowedRoles }) => {
    useEffect(() => {
      if (!isAuthenticated) {
        openLoginModal();
      }
    }, [isAuthenticated, openLoginModal]);

    if (!isAuthenticated) {
      return <div className="min-h-[60vh]" aria-hidden />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <p className="text-center text-base font-medium">
            Your account doesn&apos;t have permission to access this area.
          </p>
        </div>
      );
    }
    return children;
  };

  const LoginRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
      openLoginModal();
      return () => closeLoginModal();
    }, [openLoginModal, closeLoginModal]);

    useEffect(() => {
      if (isAuthenticated) {
        navigate('/', { replace: true });
      }
    }, [isAuthenticated, navigate]);

    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p className="text-center text-base font-medium">
          Please log in to continue.
        </p>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRedirect />} />

            {/* Course pages - detail is public, player requires auth */}
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route
              path="/course/:id/play"
              element={
                <PrivateRoute allowedRoles={['student', 'instructor']}>
                  <CoursePlayer />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <PrivateRoute allowedRoles={['student', 'instructor']}>
                  <AI />
                </PrivateRoute>
              }
            />

            {/* STUDENT Routes */}
            <Route path="/student/courses" element={<PrivateRoute allowedRoles={['student']}><StudentCourses /></PrivateRoute>} />
            <Route path="/student/credits" element={<PrivateRoute allowedRoles={['student']}><StudentCredits /></PrivateRoute>} />
            <Route path="/student/completed" element={<PrivateRoute allowedRoles={['student']}><StudentCompleted /></PrivateRoute>} />
            <Route path="/student/documents" element={<PrivateRoute allowedRoles={['student']}><StudentDocuments /></PrivateRoute>} />
            <Route path="/student/summarizer" element={<PrivateRoute allowedRoles={['student']}><StudentSummarizer /></PrivateRoute>} />
            <Route path="/student/chat" element={<PrivateRoute allowedRoles={['student']}><StudentChat /></PrivateRoute>} />
            <Route path="/student/assessments" element={<PrivateRoute allowedRoles={['student']}><StudentAssessments /></PrivateRoute>} />
            <Route path="/student/proctor-ai" element={<PrivateRoute allowedRoles={['student']}><ProctorAI /></PrivateRoute>} />

            {/* INSTRUCTOR Routes */}
            <Route path="/instructor/upload" element={<PrivateRoute allowedRoles={['instructor']}><InstructorUpload /></PrivateRoute>} />
            <Route path="/instructor/live-classes" element={<PrivateRoute allowedRoles={['instructor']}><InstructorLiveClasses /></PrivateRoute>} />
            <Route path="/instructor/credits" element={<PrivateRoute allowedRoles={['instructor']}><InstructorCredits /></PrivateRoute>} />

            {/* Profile – public & stored locally */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
        </main>

        <Modal isOpen={showLoginModal} onClose={closeLoginModal}>
          <Login onClose={closeLoginModal} />
        </Modal>

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