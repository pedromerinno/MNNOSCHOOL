
import { Course, CourseStats } from "../types";

/**
 * Calculates course statistics based on progress data
 */
export const calculateCourseStats = (
  progressData: any[] = [],
  completedLessonsCount: number = 0
): {
  stats: CourseStats;
  estimatedHoursWatched: number;
} => {
  // Count courses by progress state
  const inProgress = progressData.filter(p => p.progress > 0 && !p.completed).length;
  const completed = progressData.filter(p => p.completed).length;
  const favorites = progressData.filter(p => p.favorite).length || 0;
  
  // Calculate hours watched (mock data for now, could be replaced with actual tracking)
  // Here we estimate 15 minutes per completed lesson
  const estimatedHoursWatched = Math.round((completedLessonsCount * 15) / 60 * 10) / 10;
  
  return {
    stats: {
      favorites,
      inProgress,
      completed,
      videosCompleted: completedLessonsCount
    },
    estimatedHoursWatched
  };
};
