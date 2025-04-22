
import { useState, useEffect, useCallback } from 'react';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { supabase } from '@/integrations/supabase/client';
import { updateCourse } from '@/services/course';
import { toast } from 'sonner';

export const useCourseEdit = (courseId: string | undefined) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseCompanyIds, setCourseCompanyIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState(false);

  // Function to fetch associated companies
  const fetchCourseCompanies = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setIsFetchingCompanies(true);
      console.log(`Fetching companies for course ID: ${courseId}`);
      
      const { data, error } = await supabase
        .from('company_courses')
        .select('empresa_id')
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching course companies:', error);
        return;
      }
      
      if (data) {
        const companyIds = data.map(item => item.empresa_id);
        console.log(`Found ${companyIds.length} companies for course: ${courseId}`);
        setCourseCompanyIds(companyIds);
      }
    } catch (err) {
      console.error('Exception fetching course companies:', err);
    } finally {
      setIsFetchingCompanies(false);
    }
  }, [courseId]);

  // Initialize data when courseId changes
  useEffect(() => {
    if (courseId && !isInitialized) {
      fetchCourseCompanies();
      setIsInitialized(true);
    }
  }, [courseId, fetchCourseCompanies, isInitialized]);

  // Prefetch course's associated companies before dialog opens
  useEffect(() => {
    if (isEditDialogOpen && courseId) {
      // Make sure data is fresh when dialog opens
      fetchCourseCompanies();
    }
  }, [isEditDialogOpen, courseId, fetchCourseCompanies]);

  const handleEditCourse = useCallback(() => {
    // Fetch companies before opening dialog to eliminate flickering
    if (courseId) {
      // Start fetching asynchronously, but don't wait
      fetchCourseCompanies();
      
      // Open dialog immediately to prevent any perceived delay
      setIsEditDialogOpen(true);
      
      // Dialog content will render with current data, and update once fetch completes
    }
  }, [courseId, fetchCourseCompanies]);

  const handleCourseUpdate = async (data: CourseFormValues) => {
    if (!courseId) {
      toast.error('Erro ao atualizar curso: ID não encontrado');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await updateCourse(courseId, data);
      
      if (success) {
        // Close dialog first
        setIsEditDialogOpen(false);
        
        // Then trigger a course-updated event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('course-updated', { 
            detail: { courseId } 
          }));
        }, 50); // Small delay to ensure dialog closes smoothly first
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Erro ao atualizar curso');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isSubmitting,
    courseCompanyIds,
    isFetchingCompanies,
    handleEditCourse,
    handleCourseUpdate
  };
};
