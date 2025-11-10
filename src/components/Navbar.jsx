import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  ClipboardList,
  User,
  LogOut,
  Upload,
  Video,
  Menu,
  X
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isStudent = user?.role === 'student' || user?.role === 'both';
  const isInstructor = user?.role === 'instructor' || user?.role === 'both';

  const studentTabs = [
    { name: 'My Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Credits', path: '/student/credits', icon: CreditCard },
    { name: 'Completed', path: '/student/completed', icon: GraduationCap },
    { name: 'Documents', path: '/student/documents', icon: FileText },
    { name: 'Summarizer', path: '/student/summarizer', icon: FileText },
    { name: 'Peer Chat', path: '/student/chat', icon: MessageSquare },
    { name: 'Assessments', path: '/student/assessments', icon: ClipboardList },
  ];

  const instructorTabs = [
    { name: 'Upload Course', path: '/instructor/upload', icon: Upload },
    { name: 'Live Classes', path: '/instructor/live-classes', icon: Video },
    { name: 'Credits', path: '/instructor/credits', icon: CreditCard },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const activeTab = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-gray-300 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold text-black dark:text-white">Sarvasva</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated && isStudent && (
              <>
                {studentTabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`
                      flex items-center space-x-1 px-4 py-2 rounded-lg transition-all
                      ${activeTab(tab.path)
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                      }
                    `}
                  >
                    <tab.icon size={18} />
                    <span>{tab.name}</span>
                  </Link>
                ))}
              </>
            )}

            {isAuthenticated && isInstructor && (
              <>
                {instructorTabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`
                      flex items-center space-x-1 px-4 py-2 rounded-lg transition-all
                      ${activeTab(tab.path)
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                      }
                    `}
                  >
                    <tab.icon size={18} />
                    <span>{tab.name}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-200">
                <CreditCard size={16} className="text-yellow-400 dark:text-yellow-600" />
                <span className="text-white dark:text-black font-semibold">{user?.credits || 0}</span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white"
                >
                  <User size={18} />
                  <span className="hidden md:block">{user?.name}</span>
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
                      className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    {user?.role === 'both' && (
                      <button
                        onClick={() => {
                          // Toggle role view
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <span>Switch Role</span>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-red-400 hover:bg-gray-800"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-black dark:bg-white px-4 py-2 text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden rounded-lg p-2 hover:bg-gray-800"
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 py-4"
          >
            {isAuthenticated && isStudent && (
              <div className="space-y-2">
                {studentTabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setShowMenu(false)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg
                      ${activeTab(tab.path)
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                  >
                    <tab.icon size={18} />
                    <span>{tab.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {isAuthenticated && isInstructor && (
              <div className="space-y-2">
                {instructorTabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setShowMenu(false)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg
                      ${activeTab(tab.path)
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                  >
                    <tab.icon size={18} />
                    <span>{tab.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}

