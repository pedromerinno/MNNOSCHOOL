
import { Course, CourseStats } from "../types";

export interface CourseDataProps {
  setStats: (stats: CourseStats) => void;
  setAllCourses: (courses: Course[]) => void;
  setFilteredCourses: (courses: Course[]) => void;
  setRecentCourses: (courses: Course[]) => void;
  setHoursWatched: (hours: number) => void;
  filterCourses: (courses: Course[], filter: string) => void;
  activeFilter: string;
}

export interface CourseDataResult {
  loading: boolean;
  error: Error | null;
  fetchCourseData: () => Promise<void>;
}
