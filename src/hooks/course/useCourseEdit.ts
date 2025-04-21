
import { useState, useEffect } from 'react';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { updateCourse } from '@/services/course';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export const useCourseEdit = (courseId: string | undefined) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseCompanyIds, setCourseCompanyIds] = useState<string[]>([]);

  useEffect(() => {
    if (isEditDialogOpen && courseId) {
      const fetchCourseCompanies = async () => {
        try {
          const { data, error } = await supabase
            .from('company_courses')
            .select('empresa_id')
            .eq('course_id', courseId);
            
          if (error) {
            console.error("Error fetching course companies:", error);
            return;
          }
          
          if (data && data.length > 0) {
            const companyIds = data.map(item => item.empresa_id);
            setCourseCompanyIds(companyIds);
          } else {
            setCourseCompanyIds([]);
          }
        } catch (error) {
          console.error("Error fetching course companies:", error);
        }
      };
      
      fetchCourseCompanies();
    }
  }, [isEditDialogOpen, courseId]);

  const handleEditCourse = () => {
    setIsEditDialogOpen(true);
  };

  const handleCourseUpdate = async (data: CourseFormValues) => {
    if (!courseId) return;
    
    setIsSubmitting(true);
    try {
      await updateCourse(courseId, data);
      toast.success("Curso atualizado com sucesso");
      setIsEditDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      toast.error("Erro ao atualizar curso");
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
