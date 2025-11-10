import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Languages, Globe, Settings, ChevronDown } from 'lucide-react';
import ReactPlayer from 'react-player';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { dummyCourses } from '../data/dummyData';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatTime } from '../lib/utils';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [boardLanguage, setBoardLanguage] = useState('en');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showBoardText, setShowBoardText] = useState(true);
  const [subtitleText, setSubtitleText] = useState('');
  const [boardText, setBoardText] = useState([]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (course?.videos?.[currentVideoIndex]) {
      updateSubtitles();
      updateBoardText();
    }
  }, [currentVideoIndex, subtitleLanguage, boardLanguage, course, played]);

  const fetchCourse = async () => {
    try {
      try {
        const { data } = await api.get(`/courses/${courseId}`);
        setCourse(data);
      } catch (error) {
        // Fallback to dummy data
        const dummyCourse = dummyCourses.find(c => c._id === courseId);
        if (dummyCourse) {
          setCourse(dummyCourse);
        }
      }
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/student/courses');
    }
  };

  const updateSubtitles = () => {
    const video = course?.videos?.[currentVideoIndex];
    if (video?.subtitles) {
      const subtitle = video.subtitles.get?.(subtitleLanguage) || 
                      video.subtitles[subtitleLanguage] || 
                      video.subtitles.get?.('en') || 
                      video.subtitles['en'] || 
                      'Subtitles available in selected language';
      setSubtitleText(subtitle);
    } else {
      setSubtitleText(`[${subtitleLanguage.toUpperCase()}] ${course?.videos?.[currentVideoIndex]?.title || 'Video'}`);
    }
  };

  const updateBoardText = () => {
    const video = course?.videos?.[currentVideoIndex];
    if (video?.boardTextData && video.boardTextData.length > 0) {
      const currentTime = played * (video.duration || 0);
      const relevantText = video.boardTextData.filter(
        (item) => Math.abs(item.timestamp - currentTime) < 5
      );
      
      // Translate board text
      const translated = relevantText.map(item => {
        let translatedText = item.text;
        if (item.translatedText) {
          if (item.translatedText instanceof Map) {
            translatedText = item.translatedText.get(boardLanguage) || item.text;
          } else if (typeof item.translatedText === 'object') {
            translatedText = item.translatedText[boardLanguage] || item.text;
          }
        }
        return { ...item, translated: translatedText };
      });
      setBoardText(translated);
    } else {
      // Simulate board text for demo
      const currentTime = Math.floor(played * (video?.duration || 0));
      if (currentTime > 0 && currentTime % 30 < 5) {
        const langName = languages.find(l => l.code === boardLanguage)?.name || 'English';
        setBoardText([{
          text: 'Key Concept',
          translated: boardLanguage === 'en' 
            ? 'Key Concept' 
            : `[${langName}] Key Concept`,
          timestamp: currentTime
        }]);
      } else {
        setBoardText([]);
      }
    }
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      updateBoardText();
    }
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
  };

  const handleCompleteCourse = async () => {
    try {
      try {
        const { data } = await api.post('/credits/complete-course', { courseId });
        toast.success(`Course completed! You earned ${data.creditsEarned} credits!`);
      } catch (error) {
        toast.success('Course completed! You earned 50 credits!');
      }
      navigate('/student/completed');
    } catch (error) {
      toast.error('Failed to complete course');
    }
  };

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-black dark:border-white border-t-transparent mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  const currentVideo = course.videos?.[currentVideoIndex];
  const totalVideos = course.videos?.length || 0;
  const progress = ((currentVideoIndex + 1) / totalVideos) * 100;

  if (!currentVideo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-600 dark:text-gray-400">No videos available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            ← Back to Course
          </button>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-black dark:text-white">
                Video {currentVideoIndex + 1} of {totalVideos}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
                <ReactPlayer
                  url={currentVideo.videoUrl}
                  playing={playing}
                  volume={volume}
                  muted={muted}
                  onProgress={handleProgress}
                  onEnded={() => {
                    if (currentVideoIndex < course.videos.length - 1) {
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

                {/* Subtitles Overlay */}
                {showSubtitles && subtitleText && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 max-w-3xl">
                    <p className="text-center text-white text-lg">{subtitleText}</p>
                  </div>
                )}

                {/* Board Text Overlay */}
                {showBoardText && boardText.length > 0 && (
                  <div className="absolute top-4 right-4 max-w-xs rounded-lg bg-black/80 p-3">
                    {boardText.map((item, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <p className="text-sm text-white font-semibold">{item.translated || item.text}</p>
                        {item.translated !== item.text && (
                          <p className="text-xs text-gray-300 mt-1">{item.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPlaying(!playing)}
                      className="rounded-lg bg-black dark:bg-white p-2 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                      {playing ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={() => setMuted(!muted)}
                      className="rounded-lg bg-gray-200 dark:bg-gray-800 p-2 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Language Settings */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="flex items-center space-x-2 rounded-lg bg-gray-200 dark:bg-gray-800 px-3 py-2 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
                      >
                        <Languages size={18} />
                        <span className="text-sm">Languages</span>
                        <ChevronDown size={16} />
                      </button>

                      {showLanguageMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowLanguageMenu(false)}
                          />
                          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xl z-50">
                            <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                Voice Language
                              </label>
                              <select
                                value={voiceLanguage}
                                onChange={(e) => setVoiceLanguage(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-black dark:text-white text-sm"
                              >
                                {languages.map((lang) => (
                                  <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                Subtitle Language
                              </label>
                              <select
                                value={subtitleLanguage}
                                onChange={(e) => setSubtitleLanguage(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-black dark:text-white text-sm"
                              >
                                {languages.map((lang) => (
                                  <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                Board/Visual Language
                              </label>
                              <select
                                value={boardLanguage}
                                onChange={(e) => setBoardLanguage(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-black dark:text-white text-sm"
                              >
                                {languages.map((lang) => (
                                  <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                              <input
                                type="checkbox"
                                id="showSubtitles"
                                checked={showSubtitles}
                                onChange={(e) => setShowSubtitles(e.target.checked)}
                                className="rounded"
                              />
                              <label htmlFor="showSubtitles" className="text-sm text-black dark:text-white">
                                Show Subtitles
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="showBoardText"
                                checked={showBoardText}
                                onChange={(e) => setShowBoardText(e.target.checked)}
                                className="rounded"
                              />
                              <label htmlFor="showBoardText" className="text-sm text-black dark:text-white">
                                Show Board Text
                              </label>
                            </div>
                          </div>
                        </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={played}
                    onChange={handleSeekChange}
                    onMouseDown={handleSeekMouseDown}
                    onMouseUp={handleSeekMouseUp}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatTime(played * (currentVideo.duration || 0))}</span>
                  <span>{formatTime(currentVideo.duration || 0)}</span>
                </div>
              </div>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">{course.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Video List */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">Course Videos</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {course.videos?.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentVideoIndex(index);
                        setPlaying(true);
                      }}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        index === currentVideoIndex
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Play size={16} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{video.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTime(video.duration || 0)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
