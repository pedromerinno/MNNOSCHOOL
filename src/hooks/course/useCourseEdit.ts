
import { useState, useEffect, useCallback } from 'react';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { supabase } from '@/integrations/supabase/client';
import { updateCourse } from '@/services/course';
import { toast } from 'sonner';

export const useCourseEdit = (courseId: string | undefined) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseCompanyIds, setCourseCompanyIds] = useState<string[]>([]);

  // Fetch course's associated companies when dialog opens
  useEffect(() => {
    const fetchCourseCompanies = async () => {
      if (!courseId) return;
      
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
        setCourseCompanyIds(companyIds);
      }
    };
    
    if (isEditDialogOpen) {
      fetchCourseCompanies();
    }
  }, [courseId, isEditDialogOpen]);

  const handleEditCourse = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  const handleCourseUpdate = async (data: CourseFormValues) => {
    if (!courseId) {
      toast.error('Erro ao atualizar curso: ID não encontrado');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await updateCourse(courseId, data);
      
      if (success) {
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
