
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";

export function useCoursesEvents(
  selectedCompany: any,
  fetchCourseData: (forceRefresh?: boolean) => Promise<void>
) {
  // Listen for the course-created event
  useEffect(() => {
    const handleCourseCreated = () => {
      console.log("Course created event detected, refreshing courses");
      if (selectedCompany) {
        fetchCourseData(true);
      }
    };

    window.addEventListener('course-created', handleCourseCreated);
    
    return () => {
      window.removeEventListener('course-created', handleCourseCreated);
    };
  }, [fetchCourseData, selectedCompany]);

  // Setup and cleanup realtime subscription
  useEffect(() => {
    if (!selectedCompany?.id) return;
    
    console.log(`Setting up realtime subscription for company courses: ${selectedCompany.id}`);
    
    const companyId = selectedCompany.id;
    const channel = supabase
      .channel(`company-courses-${companyId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'company_courses',
        filter: `empresa_id=eq.${companyId}`
      }, (payload) => {
        console.log('Company course change detected:', payload);
        fetchCourseData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses'
      }, (payload) => {
        console.log('Course change detected:', payload);
        fetchCourseData();
      })
      .subscribe();
    
    return () => {
      console.log('Cleaning up realtime subscription for company courses');
      supabase.removeChannel(channel);
    };
  }, [selectedCompany?.id, fetchCourseData]);
}
