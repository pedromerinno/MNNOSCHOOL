
import { useState } from "react";
import { Course } from "./types";

export const useRecentCourses = () => {
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);

  return {
    recentCourses,
    setRecentCourses
  };
};
