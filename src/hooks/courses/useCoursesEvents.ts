
import { useEffect } from 'react';

export function useCoursesEvents(
  selectedCompany: any,
  fetchCourseData: (forceRefresh?: boolean) => Promise<void>
) {
  // Set up event listeners for company selection and course updates
  useEffect(() => {
    const handleCompanySelected = () => {
      if (selectedCompany) {
        console.log("Company selection event detected, refreshing course data");
        fetchCourseData();
      }
    };
    
    const handleCourseUpdated = (event: Event) => {
      console.log("Course updated event detected, refreshing course data", event);
      fetchCourseData(true);
    };
    
    // Listen for company selection events
    window.addEventListener('company-selected', handleCompanySelected);
    
    // Listen for course update events
    window.addEventListener('course-updated', handleCourseUpdated);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
      window.removeEventListener('course-updated', handleCourseUpdated);
    };
  }, [selectedCompany, fetchCourseData]);
}
