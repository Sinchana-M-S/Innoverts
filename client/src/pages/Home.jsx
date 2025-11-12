import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Quote, TrendingUp, Users, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import CourseCard from '../components/CourseCard';
import ParticlesBackground from '../components/ParticlesBackground';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import { dummyCourses } from '../data/dummyData';

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing platform! The multilingual support helped me learn so much faster.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    course: 'Complete Web Development Bootcamp',
  },
  {
    id: 2,
    name: 'Michael Chen',
    rating: 5,
    comment: 'Best investment in my education. The AI features are incredible!',
    avatar: 'https://i.pravatar.cc/150?img=2',
    course: 'Data Science with Python',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    rating: 5,
    comment: 'Love the peer-to-peer chat feature. Made learning collaborative and fun!',
    avatar: 'https://i.pravatar.cc/150?img=3',
    course: 'UI/UX Design Masterclass',
  },
];

const popularSkills = [
  { name: 'JavaScript', students: 12500, icon: '💻' },
  { name: 'Python', students: 9800, icon: '🐍' },
  { name: 'React', students: 11200, icon: '⚛️' },
  { name: 'UI/UX Design', students: 8500, icon: '🎨' },
  { name: 'Data Science', students: 7200, icon: '📊' },
  { name: 'Business Strategy', students: 5600, icon: '💼' },
];

const motivationalImages = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const fetchCourses = async (searchTerm = search) => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category) params.category = category;
      
      try {
        const { data } = await api.get('/api/courses', { params });
        setCourses(data.length > 0 ? data : dummyCourses);
      } catch (error) {
        // Fallback to dummy data if API fails
        console.log('Using dummy data');
        let filtered = dummyCourses;
        if (category) {
          filtered = dummyCourses.filter(c => c.category === category);
        }
        if (searchTerm) {
          filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setCourses(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses(dummyCourses);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(search);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black relative">
      <ParticlesBackground />
      <div className="relative z-10">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <h1 className="mb-6 text-6xl font-bold text-black dark:text-white md:text-7xl">
            Learn Without
            <span className="block bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Limits
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Discover courses, learn at your pace, and earn credits as you progress.
            Join thousands of learners on their educational journey.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2">
            <Search className="ml-2 text-gray-500 dark:text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses, instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-500 outline-none"
            />
            <Button type="submit" variant="primary">Search</Button>
          </form>
        </motion.div>
      </section>

      {/* Popular Skills Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Popular Skills</h2>
            <p className="text-gray-600 dark:text-gray-400">Join thousands learning these in-demand skills</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setCategory(skill.name.toLowerCase().includes('javascript') || skill.name.toLowerCase().includes('python') || skill.name.toLowerCase().includes('react') ? 'programming' : 
                             skill.name.toLowerCase().includes('design') ? 'design' :
                             skill.name.toLowerCase().includes('data') ? 'science' : 'business');
                }}
              >
                <div className="text-4xl mb-2">{skill.icon}</div>
                <h3 className="font-semibold text-black dark:text-white mb-1">{skill.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{skill.students.toLocaleString()} students</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-black dark:text-white">All Courses</h2>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="science">Science</option>
              <option value="language">Language</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
  <CourseCard key={course.id} course={course} index={index} />
))}

          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">What Students Say</h2>
            <p className="text-gray-600 dark:text-gray-400">Real feedback from our learners</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg"
              >
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="text-gray-400 dark:text-gray-600 mb-3" size={24} />
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{review.comment}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-black dark:text-white">{review.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.course}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Motivational Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Start Your Learning Journey</h2>
            <p className="text-gray-600 dark:text-gray-400">Join thousands of successful learners</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {motivationalImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="relative h-64 rounded-xl overflow-hidden group"
              >
                <img
                  src={img}
                  alt={`Motivation ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <TrendingUp size={24} className="mb-2" />
                    <h3 className="font-bold text-lg">Grow Your Skills</h3>
                    <p className="text-sm">Learn at your own pace</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Users className="mx-auto mb-2 text-blue-500" size={40} />
              <h3 className="text-3xl font-bold text-black dark:text-white">50K+</h3>
              <p className="text-gray-600 dark:text-gray-400">Active Learners</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BookOpen className="mx-auto mb-2 text-green-500" size={40} />
              <h3 className="text-3xl font-bold text-black dark:text-white">500+</h3>
              <p className="text-gray-600 dark:text-gray-400">Courses</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Award className="mx-auto mb-2 text-yellow-500" size={40} />
              <h3 className="text-3xl font-bold text-black dark:text-white">10K+</h3>
              <p className="text-gray-600 dark:text-gray-400">Certificates Issued</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Star className="mx-auto mb-2 text-purple-500" size={40} />
              <h3 className="text-3xl font-bold text-black dark:text-white">4.8</h3>
              <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
}
