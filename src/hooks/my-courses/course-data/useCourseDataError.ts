
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { CourseStats } from "../types";

/**
 * Hook for handling course data errors and resetting states
 */
export const useCourseDataError = (
  setStats: (stats: CourseStats) => void,
  setRecentCourses: (courses: any[]) => void,
  setFilteredCourses: (courses: any[]) => void,
  setAllCourses: (courses: any[]) => void
) => {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const handleError = useCallback((error: Error) => {
    console.error('Error fetching course data:', error);
    setError(error);
    
    // Display toast notification
    toast({
      title: "Erro ao carregar cursos",
      description: error.message || "Ocorreu um erro inesperado",
      variant: "destructive",
    });
    
    // Reset states on error
    setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
    setRecentCourses([]);
    setFilteredCourses([]);
    setAllCourses([]);
  }, [toast, setStats, setRecentCourses, setFilteredCourses, setAllCourses]);
  
  return {
    error,
    setError,
    handleError
  };
};
