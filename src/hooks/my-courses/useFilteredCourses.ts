
import { useState, useCallback, useRef, useEffect } from "react";
import { FilterOption, Course } from "./types";

export const useFilteredCourses = () => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // Filter courses based on selected tab
  const filterCourses = useCallback((courses: Course[], filter: FilterOption) => {
    switch (filter) {
      case 'favorites':
        setFilteredCourses(courses.filter(course => course.favorite));
        break;
      case 'completed':
        setFilteredCourses(courses.filter(course => course.completed));
        break;
      case 'in-progress':
        setFilteredCourses(courses.filter(course => course.progress && course.progress > 0 && !course.completed));
        break;
      case 'all':
      default:
        setFilteredCourses(courses);
        break;
    }
  }, []);

  // Handle filter change - use ref to avoid dependency on allCourses
  const allCoursesRef = useRef(allCourses);
  useEffect(() => {
    allCoursesRef.current = allCourses;
  }, [allCourses]);

  const handleFilterChange = useCallback((newFilter: FilterOption) => {
    setActiveFilter(newFilter);
    filterCourses(allCoursesRef.current, newFilter);
  }, [filterCourses]);

  return {
    filteredCourses,
    setFilteredCourses,
    activeFilter,
    setActiveFilter,
    allCourses, 
    setAllCourses,
    filterCourses,
    handleFilterChange,
  };
};
