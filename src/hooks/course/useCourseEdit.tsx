
import { useState, useEffect } from 'react';
import { useCourseJobRoles } from './useCourseJobRoles';
import { supabase } from "@/integrations/supabase/client";

export const useCourseEdit = (courseId: string | undefined) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseCompanyIds, setCourseCompanyIds] = useState<string[]>([]);
  const { jobRoleIds } = useCourseJobRoles(courseId);

  const fetchCourseCompanies = async () => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from('company_courses')
        .select('empresa_id')
        .eq('course_id', courseId);

      if (error) throw error;

      const companyIds = data?.map(item => item.empresa_id) || [];
      setCourseCompanyIds(companyIds);
    } catch (error) {
      console.error('Error fetching course companies:', error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseCompanies();
    }
  }, [courseId]);

  const handleEditCourse = () => {
    setIsEditDialogOpen(true);
  };

  const handleCourseUpdate = async (courseData: any) => {
    setIsSubmitting(true);
    
    try {
      // Include job role IDs in the course data
      const dataWithJobRoles = {
        ...courseData,
        jobRoleIds: jobRoleIds
      };

      // The actual update will be handled by the form's onSubmit
      return dataWithJobRoles;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isSubmitting,
    courseCompanyIds,
    jobRoleIds,
    handleEditCourse,
    handleCourseUpdate
  };
};
