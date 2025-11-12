import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function normalizeLanguageMap(value) {
  if (!value) return {};
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }
  if (Array.isArray(value)) {
    return value.reduce((acc, item) => {
      if (!item || typeof item !== 'object') return acc;
      const key = item.language || item.code;
      if (key && item.text) {
        acc[key] = item.text;
      }
      return acc;
    }, {});
  }
  if (typeof value === 'object') {
    return value;
  }
  return {};
}

export function normalizeCourse(rawCourse) {
  if (!rawCourse || typeof rawCourse !== 'object') return null;

  const courseId =
    rawCourse.id ||
    rawCourse._id ||
    rawCourse.slug ||
    rawCourse.uuid ||
    (rawCourse.courseId ? String(rawCourse.courseId) : null);

  const videos = Array.isArray(rawCourse.videos)
    ? rawCourse.videos.map((video, index) => {
        const duration = Number(video?.duration) || 0;
        return {
          ...video,
          id:
            video?.id ||
            video?._id ||
            video?.videoId ||
            `${courseId || 'course'}-video-${index}`,
          title: video?.title || `Lesson ${index + 1}`,
          videoUrl: video?.videoUrl || video?.url || '',
          duration,
          subtitles: normalizeLanguageMap(video?.subtitles),
          boardTextData: Array.isArray(video?.boardTextData)
            ? video.boardTextData.map((entry, entryIndex) => ({
                ...entry,
                id:
                  entry?.id ||
                  entry?._id ||
                  `${courseId || 'course'}-board-${index}-${entryIndex}`,
                translatedText: normalizeLanguageMap(entry?.translatedText),
              }))
            : [],
        };
      })
    : [];

  return {
    ...rawCourse,
    id: courseId,
    price: rawCourse.price ?? rawCourse.cost ?? 0,
    averageRating: rawCourse.averageRating ?? rawCourse.rating ?? 0,
    totalStudents:
      rawCourse.totalStudents ??
      rawCourse.enrolledStudents?.length ??
      rawCourse.totalEnrolled ??
      0,
    learningObjectives: Array.isArray(rawCourse.learningObjectives)
      ? rawCourse.learningObjectives
      : Array.isArray(rawCourse.objectives)
      ? rawCourse.objectives
      : [],
    videos,
  };
}

