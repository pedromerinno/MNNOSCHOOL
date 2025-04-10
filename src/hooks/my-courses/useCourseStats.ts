
import { useState } from "react";
import { CourseStats } from "./types";

export const useCourseStats = () => {
  const [stats, setStats] = useState<CourseStats>({
    favorites: 0,
    inProgress: 0,
    completed: 0,
    videosCompleted: 0
  });
  
  const [hoursWatched, setHoursWatched] = useState(0);

  return {
    stats,
    setStats,
    hoursWatched,
    setHoursWatched
  };
};
