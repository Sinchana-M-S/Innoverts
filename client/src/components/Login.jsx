import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import toast from 'react-hot-toast';

export default function Login({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'instructor'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // Assuming authStore has a login method

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call for login
      // In a real app, this would call your backend /api/auth/login endpoint
      // and receive a token and user data including role.
      console.log(`Attempting to log in as ${role} with email: ${email}`);
      
      // For now, we'll simulate a successful login and set a dummy user
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const dummyUser = {
        _id: 'guestUser',
        email,
        role,
        enrolledCourses: role === 'student' ? ['1', '2'] : [], // Dummy enrolled courses
        completedCourses: [],
        credits: 100,
        name: role === 'student' ? 'Guest Student' : 'Guest Instructor',
        isDemoUser: true,
      };

      login(dummyUser); // Update auth store with dummy user
      toast.success(`Logged in as ${role}!`);
      onClose(); // Close modal after login

      // Redirect based on role
      if (role === 'student') {
        navigate('/student/courses');
      } else if (role === 'instructor') {
        navigate('/instructor/upload');
      }

    } catch (err) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={() => setRole('student')}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Login as Student</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="role"
                value="instructor"
                checked={role === 'instructor'}
                onChange={() => setRole('instructor')}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Login as Instructor</span>
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
