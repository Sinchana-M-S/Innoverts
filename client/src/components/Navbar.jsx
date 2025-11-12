import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Bot, Menu, X, User, MessageSquare, ClipboardCheck, LogIn, LogOut } from "lucide-react"; // Added LogIn, LogOut
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import useAuthStore from '../store/authStore'; // Import auth store
import Button from './ui/Button'; // Assuming Button is used for login/logout

export default function Navbar() {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, isAuthenticated, logout, openLoginModal } = useAuthStore(); // Get user, isAuthenticated, logout

  const handleTabClick = (e, path) => {
    // If trying to access AI without auth, show login modal
    if (!isAuthenticated && path === '/ai') {
      e.preventDefault();
      openLoginModal();
    }
  };

  const studentTabs = [
    { name: "My Courses", path: "/student/courses", icon: BookOpen },
    { name: "Summarizer", path: "/student/summarizer", icon: BookOpen },
    { name: "Peer-to-Peer Chat", path: "/student/chat", icon: MessageSquare },
    { name: "AI Assessments", path: "/student/assessments", icon: ClipboardCheck },
  ];

  const instructorTabs = [
    { name: "Upload Course", path: "/instructor/upload", icon: BookOpen },
    { name: "Live Classes", path: "/instructor/live-classes", icon: BookOpen },
    { name: "Instructor Credits", path: "/instructor/credits", icon: BookOpen },
  ];

  const publicTabs = [
    { name: "Home", path: "/", icon: BookOpen },
    { name: "Sarvasva AI", path: "/ai", icon: Bot },
  ];

  const getVisibleTabs = () => {
    if (!isAuthenticated) {
      return publicTabs;
    }
    if (user?.role === 'student') {
      return [...publicTabs, ...studentTabs];
    }
    if (user?.role === 'instructor') {
      return [...publicTabs, ...instructorTabs];
    }
    return publicTabs; // Fallback for guest or unhandled roles
  };

  const visibleTabs = getVisibleTabs();

  const activeTab = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-gray-300 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* ✅ Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold text-black dark:text-white">
              Sarvasva
            </span>
          </Link>

          {/* ✅ Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleTabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                onClick={(e) => handleTabClick(e, tab.path)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all
                  ${
                    activeTab(tab.path)
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                  }`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </Link>
            ))}
          </div>

          {/* ✅ Right Controls */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white"
                >
                  <User size={18} />
                  <span className="hidden md:block">{user?.name || 'User'}</span>
                </button>

                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-xl"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mt-2"
                      variant="ghost"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                className="flex items-center space-x-2"
                onClick={() => openLoginModal()}
              >
                <LogIn size={18} />
                <span>Login</span>
              </Button>
            )}

            {/* ✅ Mobile Menu Icon */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden rounded-lg p-2 hover:bg-gray-800"
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ✅ Mobile Menu */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 py-4"
          >
            <div className="space-y-2">
              {visibleTabs.map((tab) => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  onClick={(e) => {
                    handleTabClick(e, tab.path);
                    setShowMenu(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg
                    ${
                      activeTab(tab.path)
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                    }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.name}</span>
                </Link>
              ))}
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    openLoginModal();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center space-x-2 px-4 py-2 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
              )}
              {isAuthenticated && (
                <Button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                  variant="ghost"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
