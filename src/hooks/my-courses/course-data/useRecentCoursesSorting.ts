
import { Course } from "../types";

/**
 * Sorts and filters recent courses
 */
export const sortRecentCourses = (courses: Course[]): Course[] => {
  // Get courses in progress (not completed and with progress > 0)
  return courses
    .filter(c => c.progress && c.progress > 0 && !c.completed)
    .sort((a, b) => {
      // Sort by last accessed, if available
      if (a.last_accessed && b.last_accessed) {
        return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime();
      }
      // If no last_accessed, sort by progress (higher progress first)
      return (b.progress || 0) - (a.progress || 0);
    })
    .slice(0, 3);
};
