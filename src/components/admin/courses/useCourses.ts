import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Course } from './types';
import { fetchCourses, deleteCourse } from '@/services/courseService';
import { useCourseForm } from '@/hooks/useCourseForm';
import { useCompanyCoursesManager } from '@/hooks/useCompanyCoursesManager';
import { supabase } from "@/integrations/supabase/client";

export const useCourses = (companyId?: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    selectedCourse, 
    setSelectedCourse, 
    isFormOpen, 
    setIsFormOpen, 
    isSubmitting, 
    handleFormSubmit 
  } = useCourseForm(() => loadCourses());

  const { 
    isCompanyManagerOpen, 
    setIsCompanyManagerOpen 
  } = useCompanyCoursesManager();

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      if (!currentUserId) {
        setCourses([]);
        setIsLoading(false);
        return;
      }

      // Check if user is super admin
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', currentUserId)
        .single();

      if (currentUserProfile?.super_admin) {
        // Super admins can see all courses
        const allCourses = await fetchCourses(companyId);
        setCourses(allCourses);
      } else if (currentUserProfile?.is_admin) {
        // Regular admins can only see courses from their companies
        const { data: userCompanies } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .eq('user_id', currentUserId);

        if (!userCompanies?.length) {
          setCourses([]);
          return;
        }

        const companyIds = userCompanies.map(uc => uc.empresa_id);

        // Get courses associated with user's companies
        const { data: companyCourses } = await supabase
          .from('company_courses')
          .select('course_id')
          .in('empresa_id', companyIds);

        if (!companyCourses?.length) {
          setCourses([]);
          return;
        }

        const courseIds = [...new Set(companyCourses.map(cc => cc.course_id))];

        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);

        if (courses) {
          setCourses(courses);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      const success = await deleteCourse(courseId);
      if (success) {
        loadCourses();
      }
    }
  };

  // Listen for company changes in settings
  useEffect(() => {
    const handleSettingsCompanyChange = (e: CustomEvent) => {
      if (e.detail?.company?.id) {
        console.log(`Company changed in settings, updating courses for: ${e.detail.company.nome}`);
        // Close any open dialogs
        setIsFormOpen(false);
        setIsCompanyManagerOpen(false);
        setSelectedCourse(null);
      }
    };

    window.addEventListener('settings-company-changed', handleSettingsCompanyChange as EventListener);
    
    return () => {
      window.removeEventListener('settings-company-changed', handleSettingsCompanyChange as EventListener);
    };
  }, []);

  // Fetch courses on mount or when companyId changes
  useEffect(() => {
    loadCourses();
  }, [companyId]); 

  return {
    courses,
    isLoading,
    selectedCourse,
    setSelectedCourse,
    isFormOpen,
    setIsFormOpen,
    isCompanyManagerOpen,
    setIsCompanyManagerOpen,
    isSubmitting,
    fetchCourses: loadCourses,
    handleDeleteCourse,
    handleFormSubmit
  };
};
