import { Link } from 'react-router-dom';
import { GraduationCap, Award, BookOpen, Code, Palette, Briefcase, FlaskConical, Languages } from 'lucide-react';

const skills = [
  { name: 'Web Development', icon: Code, category: 'programming' },
  { name: 'UI/UX Design', icon: Palette, category: 'design' },
  { name: 'Business Strategy', icon: Briefcase, category: 'business' },
  { name: 'Data Science', icon: FlaskConical, category: 'science' },
  { name: 'Languages', icon: Languages, category: 'language' },
];

const certifications = [
  { name: 'Full Stack Developer', category: 'programming' },
  { name: 'UI/UX Designer', category: 'design' },
  { name: 'Business Analyst', category: 'business' },
  { name: 'Data Scientist', category: 'science' },
  { name: 'Language Expert', category: 'language' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Skills Section */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center space-x-2">
              <BookOpen size={20} />
              <span>Popular Skills</span>
            </h3>
            <ul className="space-y-2">
              {skills.map((skill) => (
                <li key={skill.name}>
                  <Link
                    to={`/?category=${skill.category}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <skill.icon size={16} />
                    <span>{skill.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications Section */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center space-x-2">
              <Award size={20} />
              <span>Certifications</span>
            </h3>
            <ul className="space-y-2">
              {certifications.map((cert) => (
                <li key={cert.name}>
                  <Link
                    to={`/?category=${cert.category}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <GraduationCap size={16} />
                    <span>{cert.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">About Sarvasva</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn without limits. Access courses, earn credits, and advance your career with our comprehensive learning platform.
            </p>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <GraduationCap size={20} />
              <span>Empowering learners worldwide</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Sarvasva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

