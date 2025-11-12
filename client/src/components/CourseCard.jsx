import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Play } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';

export default function CourseCard({ course, index = 0 }) {
  if (!course) return null; // ✅ Prevent undefined crash

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group h-full cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-105">
        
        {/* Thumbnail */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <Play size={48} className="text-gray-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Card Body */}
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-black dark:text-white">
            {course.title}
          </h3>

          <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {course.description}
          </p>

          {/* Rating + Students */}
          <div className="mb-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
            <div className="flex items-center space-x-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-black dark:text-white">
                {course.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span>({course.totalRatings || 0})</span>
            </div>

            <div className="flex items-center space-x-1">
              <Users size={16} />
              <span>{course.enrolledStudents?.length || 0}</span>
            </div>
          </div>

          {/* Instructor + Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {course.instructorName}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-yellow-400">
              <span className="font-bold">{course.price}</span>
              <span className="text-xs">credits</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link to={`/course/${course.id || course._id}`} className="mt-4 block">
            <Button variant="primary" className="w-full">
              View Course
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
