import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Quote, TrendingUp, Users, Award, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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
  { name: 'JavaScript', students: 12500, icon: '💻', category: 'programming' },
  { name: 'Python', students: 9800, icon: '🐍', category: 'programming' },
  { name: 'React', students: 11200, icon: '⚛️', category: 'programming' },
  { name: 'UI/UX Design', students: 8500, icon: '🎨', category: 'design' },
  { name: 'Data Science', students: 7200, icon: '📊', category: 'science' },
  { name: 'Business Strategy', students: 5600, icon: '💼', category: 'business' },
  { name: 'Cybersecurity', students: 7400, icon: '🔒', category: 'security' },
  { name: 'Artificial Intelligence', students: 9800, icon: '🤖', category: 'ai' },
  { name: 'Flutter', students: 8600, icon: '📱', category: 'programming' },
  { name: 'Photography', students: 5200, icon: '📸', category: 'art' },
  { name: 'Spanish', students: 11000, icon: '🗣️', category: 'language' },
  { name: 'Digital Marketing', students: 7200, icon: '📣', category: 'marketing' },
  { name: 'SQL', students: 4300, icon: '🗄️', category: 'programming' },
  { name: 'DevOps', students: 3900, icon: '⚙️', category: 'engineering' },
  { name: 'Cloud Computing', students: 4700, icon: '☁️', category: 'engineering' },
  { name: 'Machine Learning', students: 8200, icon: '📈', category: 'science' },
  { name: 'Product Management', students: 3000, icon: '📦', category: 'business' },
  { name: 'Figma', students: 4100, icon: '🧩', category: 'design' },
  { name: 'Node.js', students: 6500, icon: '🟩', category: 'programming' },
];

const faqData = [
  {
    id: 1,
    question: 'What courses are available on Sarvasva?',
    answer: 'Sarvasva offers courses across multiple categories including Programming, Design, Data Science, Business, Language, and more. Browse all courses in the main section and filter by category.'
  },
  {
    id: 2,
    question: 'How do I enroll in a course?',
    answer: 'Click on any course card to view details, then click the Enroll button. You can track your progress and access course materials from your student dashboard.'
  },
  {
    id: 3,
    question: 'Are there certificates upon completion?',
    answer: 'Yes! Upon completing a course, you will receive a certificate that you can share with potential employers or on your professional profile.'
  },
  {
    id: 4,
    question: 'Can I download course materials?',
    answer: 'Most course materials, including videos and documents, are available for download so you can learn offline at your own pace.'
  },
  {
    id: 5,
    question: 'How do I track my learning progress?',
    answer: 'Your progress is tracked automatically. Visit your profile or student dashboard to see completed modules, quiz scores, and overall course progress.'
  },
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
  const [expandedFaq, setExpandedFaq] = useState(null);
  const sliderRef = useRef(null);

  // Build categories dynamically from dummy data so the dropdown always matches
  const availableCategories = Array.from(
    new Set((dummyCourses || []).map((c) => (c.category || '').toLowerCase()).filter(Boolean))
  ).sort();

  useEffect(() => {
    // Initial fetch and also refetch when category changes
    fetchCourses();
  }, [category]);


  const fetchCourses = async (searchTerm = search, catArg = category) => {
    try {
      setLoading(true);
      const params = {};
      const q = typeof searchTerm === 'string' ? searchTerm.trim() : '';
      if (q !== '') params.search = q;
      if (catArg) params.category = catArg;

      // Attempt to fetch from API. If the API responds with an empty array,
      // keep that empty result so the UI can show "No courses found".
      // Only fall back to `dummyCourses` when the network/API call fails.
      try {
        console.log('Fetching from API with params:', params);
        const { data } = await api.get('/api/courses', { params });
        // If API returns an empty array for an unfiltered (initial) request,
        // treat it as a likely server-side/read failure and fallback to dummy data.
        if (Array.isArray(data)) {
          if (data.length === 0) {
            // No results from API. If this was an unfiltered request, fall back to full dummy set.
            if (Object.keys(params).length === 0) {
              console.warn('API returned empty list on initial unfiltered request — falling back to dummyCourses');
              setCourses(dummyCourses || []);
            } else {
              // For filtered requests, try using the local dummy dataset as a graceful fallback.
              console.warn('API returned empty list for params, falling back to locally filtered dummyCourses', params);
              let fallbackFiltered = dummyCourses || [];
              if (catArg) {
                const cat = String(catArg).toLowerCase();
                fallbackFiltered = fallbackFiltered.filter((c) => (c.category || '').toLowerCase() === cat);
              }
              if (q !== '') {
                const qq = q.toLowerCase();
                fallbackFiltered = fallbackFiltered.filter((c) => {
                  const title = (c.title || '').toLowerCase();
                  const desc = (c.description || '').toLowerCase();
                  const inst = (c.instructorName || '').toLowerCase();
                  const tags = (c.tags || []).join(' ').toLowerCase();
                  return title.includes(qq) || desc.includes(qq) || inst.includes(qq) || tags.includes(qq);
                });
              }
              console.log('Local fallback produced', fallbackFiltered.length, 'courses');
              setCourses(fallbackFiltered);
            }
          } else {
            console.log('API returned', data.length, 'courses');
            setCourses(data);
          }
        } else {
          setCourses([]);
        }
      } catch (error) {
        // Fallback to dummy data if API fails
        console.log('API request failed, falling back to dummy data', error?.message || error);
        let filtered = dummyCourses || [];
        if (catArg) {
          const cat = String(catArg).toLowerCase();
          filtered = filtered.filter((c) => (c.category || '').toLowerCase() === cat);
        }
        if (q !== '') {
          const qq = q.toLowerCase();
          filtered = filtered.filter((c) => {
            const title = (c.title || '').toLowerCase();
            const desc = (c.description || '').toLowerCase();
            const inst = (c.instructorName || '').toLowerCase();
            const tags = (c.tags || []).join(' ').toLowerCase();
            return title.includes(qq) || desc.includes(qq) || inst.includes(qq) || tags.includes(qq);
          });
        }
        console.log('Dummy fallback produced', filtered.length, 'courses for category', catArg || 'ALL', 'and search', q || 'NONE');
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

  // If user clears the search input, refresh the courses list
  useEffect(() => {
    if (search === '') fetchCourses('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

        {/* Courses Section */}

        {/* Courses Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-black dark:text-white">All Courses</h2>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600 dark:text-gray-400" />
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  setSearch('');
                  // Immediately fetch using the new category to avoid race with state
                  fetchCourses('', newCat);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
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
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Popular Skills Section (slider) */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-4 relative">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Popular Skills</h2>
              <p className="text-gray-600 dark:text-gray-400">Join thousands learning these in-demand skills</p>
            </div>
            <div className="relative">
              <button
                aria-label="Previous"
                onClick={() => {
                  const el = sliderRef.current;
                  if (el) el.scrollBy({ left: -Math.round(el.offsetWidth * 0.8), behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white dark:bg-gray-800 p-2 shadow-md"
              >
                <ChevronLeft />
              </button>

              <div
                ref={sliderRef}
                className="flex space-x-4 overflow-x-auto no-scrollbar py-2 px-10"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {popularSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex-shrink-0 w-56 text-center p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      const newCat = skill.category;
                      setCategory(newCat);
                      setSearch('');
                      fetchCourses('', newCat);
                    }}
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    <div className="text-4xl mb-2">{skill.icon}</div>
                    <h3 className="font-semibold text-black dark:text-white mb-1">{skill.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{skill.students.toLocaleString()} students</p>
                  </motion.div>
                ))}
              </div>

              <button
                aria-label="Next"
                onClick={() => {
                  const el = sliderRef.current;
                  if (el) el.scrollBy({ left: Math.round(el.offsetWidth * 0.8), behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white dark:bg-gray-800 p-2 shadow-md"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* Reviews Section (moved below Popular Skills) */}
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
                    <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full" />
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

        {/* FAQ Section */}
        <section className="py-16 bg-white dark:bg-black">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600 dark:text-gray-400">Find answers to common questions about our courses and learning platform</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqData.map((faq) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <h3 className="font-semibold text-black dark:text-white text-lg">{faq.question}</h3>
                    <span
                      className={`flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                        expandedFaq === faq.id ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-4 border-t border-gray-200 dark:border-gray-800"
                    >
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
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
