
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

  // Function to fetch associated companies
  const fetchCourseCompanies = useCallback(async () => {
    if (!courseId) return;
    
    console.log(`Fetching companies for course ID: ${courseId}`);
    try {
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
    }
  }, [courseId]);

  // Initialize data when courseId changes
  useEffect(() => {
    if (courseId && !isInitialized) {
      fetchCourseCompanies();
      setIsInitialized(true);
    }
  }, [courseId, fetchCourseCompanies, isInitialized]);

  // Prefetch course's associated companies when dialog is about to open
  useEffect(() => {
    if (isEditDialogOpen) {
      fetchCourseCompanies();
      
      // Prevent body scrolling when dialog opens
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore body scrolling when dialog closes
        document.body.style.overflow = '';
      };
    }
  }, [isEditDialogOpen, fetchCourseCompanies]);

  const handleEditCourse = useCallback(() => {
    // Fetch companies before opening dialog
    if (courseId) {
      fetchCourseCompanies();
    }
    
    // Use requestAnimationFrame to ensure smoother transition
    requestAnimationFrame(() => {
      setIsEditDialogOpen(true);
    });
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
        // Smooth closing of dialog
        setIsEditDialogOpen(false);
        
        // Trigger a course-updated event instead of a generic refresh
        window.dispatchEvent(new CustomEvent('course-updated', { 
          detail: { courseId } 
        }));
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
    handleEditCourse,
    handleCourseUpdate
  };
};
