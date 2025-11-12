import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Languages,
  ChevronDown,
  Video,
  Clock,
  SkipForward,
  SkipBack,
  Award,
  ListChecks,
  BookOpen,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import ReactPlayer from 'react-player';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { dummyCourses } from '../data/dummyData';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatTime, normalizeCourse } from '../lib/utils';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
];

export default function CoursePlayer() {
  const { id } = useParams();
  const courseId = id;
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const fallbackCourse = useMemo(() => {
    const fallback =
      dummyCourses.find((c) => c.id === courseId || c._id === courseId) ||
      dummyCourses[0];
    return normalizeCourse(fallback);
  }, [courseId]);

  const [course, setCourse] = useState(fallbackCourse);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [boardLanguage, setBoardLanguage] = useState('en');
  const [subtitleText, setSubtitleText] = useState('');
  const [boardText, setBoardText] = useState([]);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showBoardText, setShowBoardText] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // ✅ FETCH COURSE (JSON BACKEND)
  useEffect(() => {
    const load = async () => {
      setLoadingCourse(true);
      try {
        const { data } = await api.get(`/api/courses/${courseId}`);
        const normalized = normalizeCourse(data);
        if (normalized) {
          setCourse(normalized);
          return;
        }
      } catch (error) {
        console.warn('Falling back to demo course:', error);
      } finally {
        setCourse((current) => current ?? fallbackCourse);
        setLoadingCourse(false);
      }
    };
    setCourse(fallbackCourse);
    setCurrentVideoIndex(0);
    load();
  }, [courseId, fallbackCourse]);

  // ✅ Update subtitles + board text dynamically
  useEffect(() => {
    if (course?.videos?.[currentVideoIndex]) {
      updateSubtitles();
      updateBoardText();
    }
  }, [currentVideoIndex, subtitleLanguage, boardLanguage, course, played]);

  // ✅ JSON-safe subtitle handling
  const updateSubtitles = () => {
    const video = course?.videos?.[currentVideoIndex];
    if (!video) return;

    const subs = video.subtitles;

    const text =
      subs?.[subtitleLanguage] ||
      subs?.['en'] ||
      `[${subtitleLanguage.toUpperCase()}] Subtitles not available`;

    setSubtitleText(text);
  };

  // ✅ JSON-safe board text handling
  const updateBoardText = () => {
    const video = course?.videos?.[currentVideoIndex];
    if (!video) return;

    const currentTime = played * (video.duration || 0);

    if (video.boardTextData?.length > 0) {
      const matches = video.boardTextData.filter(
        item => Math.abs((item.timestamp || 0) - currentTime) < 5
      );

      const translated = matches.map(item => ({
        ...item,
        translated:
          item.translatedText?.[boardLanguage] ||
          item.translatedText?.['en'] ||
          item.text,
      }));

      setBoardText(translated);
    } else {
      setBoardText([]);
    }
  };

  // ✅ Track progress
  const handleProgress = state => {
    setPlayed(state.played);
    updateBoardText();
  };

  // ✅ JSON Backend course completion
  const handleCompleteCourse = async () => {
    try {
      const guestId = localStorage.getItem('guestId');
      if (!guestId) {
        localStorage.setItem(
          'guestId',
          `g-${Math.random().toString(36).substring(2, 10)}`
        );
      }
      const activeGuestId = localStorage.getItem('guestId');

      await api.post(`/api/users/${activeGuestId}/complete-course`, { courseId });

      toast.success("✅ Course Completed! 50 credits added.");
      navigate("/student/completed");
    } catch (error) {
      toast.success("✅ Course Completed! (Demo)");
      navigate("/student/completed");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  const video = course.videos?.[currentVideoIndex];
  const totalVideos = course.videos?.length || 0;
  const progressPercent =
    totalVideos > 0 ? ((currentVideoIndex + 1) / totalVideos) * 100 : 0;

  const totalMinutes = Math.round(
    (course.videos || []).reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    ) / 60
  );

  if (!video) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="mx-auto max-w-xl">
            <CardContent className="p-12 space-y-4">
              <Video className="mx-auto text-gray-400" size={32} />
              <h2 className="text-2xl font-semibold">
                No videos available for this course yet.
              </h2>
              <Button onClick={() => navigate(`/course/${courseId}`)}>
                Back to course overview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={handleBack}
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <h1 className="mt-2 text-3xl font-bold text-black dark:text-white">
              {course.title}
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Card className="border-none bg-gray-100 dark:bg-gray-900">
              <CardContent className="flex items-center space-x-3 px-4 py-3">
                <Video size={18} className="text-blue-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Lessons
                  </p>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {totalVideos}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-gray-100 dark:bg-gray-900">
              <CardContent className="flex items-center space-x-3 px-4 py-3">
                <Clock size={18} className="text-purple-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Total Time
                  </p>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {totalMinutes} min
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-gray-100 dark:bg-gray-900">
              <CardContent className="flex items-center space-x-3 px-4 py-3">
                <Award size={18} className="text-amber-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Current Progress
                  </p>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {Math.round(progressPercent)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
                <ReactPlayer
                  url={video.videoUrl}
                  playing={playing}
                  muted={muted}
                  volume={volume}
                  onProgress={handleProgress}
                  onEnded={() => {
                    if (currentVideoIndex < totalVideos - 1) {
                      setCurrentVideoIndex(currentVideoIndex + 1);
                      setPlaying(true);
                    } else {
                      handleCompleteCourse();
                    }
                  }}
                  width="100%"
                  height="100%"
                  className="absolute top-0 left-0"
                />

                {/* Subtitles */}
                {showSubtitles && subtitleText && (
                  <div className="absolute bottom-24 w-full text-center px-4">
                    <p className="inline-block rounded-lg bg-black/80 px-4 py-2 text-lg text-white">
                      {subtitleText}
                    </p>
                  </div>
                )}

                {/* Board text */}
                {showBoardText && boardText.length > 0 && (
                  <div className="absolute top-4 right-4 max-w-xs rounded-lg bg-black/80 p-3">
                    {boardText.map((item, i) => (
                      <p key={i} className="text-sm text-white">
                        {item.translated}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    {playing ? (
                      <>
                        <Pause size={16} className="mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Play
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-2 rounded-full bg-white px-3 py-1 text-sm shadow dark:bg-gray-800">
                    <button
                      onClick={() => setMuted(!muted)}
                      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Toggle mute"
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="h-1 w-24 accent-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="inline-flex items-center space-x-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Languages size={16} />
                    <span>Languages</span>
                    <ChevronDown size={14} />
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      disabled={currentVideoIndex === 0}
                      onClick={() => {
                        if (currentVideoIndex > 0) {
                          setCurrentVideoIndex(currentVideoIndex - 1);
                          setPlaying(true);
                        }
                      }}
                      className="inline-flex items-center space-x-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <SkipBack size={16} />
                      <span>Prev</span>
                    </button>
                    <button
                      disabled={currentVideoIndex === totalVideos - 1}
                      onClick={() => {
                        if (currentVideoIndex < totalVideos - 1) {
                          setCurrentVideoIndex(currentVideoIndex + 1);
                          setPlaying(true);
                        }
                      }}
                      className="inline-flex items-center space-x-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <span>Next</span>
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>

                {showLanguageMenu && (
                  <div className="mt-4 grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
                    <div>
                      <label className="text-xs uppercase text-gray-500 dark:text-gray-400">
                        Subtitles
                      </label>
                      <select
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
                        value={subtitleLanguage}
                        onChange={(e) => setSubtitleLanguage(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs uppercase text-gray-500 dark:text-gray-400">
                        Board Language
                      </label>
                      <select
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
                        value={boardLanguage}
                        onChange={(e) => setBoardLanguage(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={showSubtitles}
                          onChange={() => setShowSubtitles(!showSubtitles)}
                        />
                        <span>Show subtitles</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={showBoardText}
                          onChange={() => setShowBoardText(!showBoardText)}
                        />
                        <span>Show board notes</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={played}
                    onChange={(e) => setPlayed(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>{formatTime(played * (video.duration || 0))}</span>
                    <span>{formatTime(video.duration || 0)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <CardContent className="space-y-3 p-5">
                  <h3 className="text-base font-semibold text-black dark:text-white">
                    Lesson Highlights
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep an eye on the board notes on the top-right of the
                    player. They update in real time with the instructor’s key
                    points in your preferred language.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <CardContent className="space-y-3 p-5">
                  <h3 className="text-base font-semibold text-black dark:text-white">
                    Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Press space to pause or resume the lesson quickly.</li>
                    <li>• Use the Next button to skip straight to upcoming content.</li>
                    <li>• Switch subtitles and board language for bilingual learning.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Course Outline
                  </h3>
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    {Math.round(progressPercent)}% complete
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {course.videos?.map((lesson, index) => {
                    const isActive = index === currentVideoIndex;
                    return (
                      <button
                        key={lesson.id || index}
                        onClick={() => {
                          setCurrentVideoIndex(index);
                          setPlaying(true);
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-blue-300 dark:border-gray-800 dark:hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-black dark:text-white">
                          <span className="flex items-center space-x-2">
                            <ListChecks
                              size={16}
                              className={isActive ? 'text-blue-500' : 'text-gray-400'}
                            />
                            <span className="line-clamp-1">{lesson.title}</span>
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(lesson.duration)}
                          </span>
                        </div>

                        {lesson.subtitle && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {lesson.subtitle}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <CardContent className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Next Steps
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-start space-x-2">
                    <BookOpen size={16} className="mt-[2px] text-blue-500" />
                    <span>
                      Visit the Summarizer after this lesson to generate instant
                      notes and flashcards.
                    </span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <MessageSquare size={16} className="mt-[2px] text-purple-500" />
                    <span>
                      Discuss tricky topics with peers inside the student chat room.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
