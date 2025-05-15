
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Course } from './types';
import { fetchCourses, deleteCourse } from '@/services/course';
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

      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', currentUserId)
        .single();

      if (currentUserProfile?.super_admin) {
        // Super admins see either all courses or filtered by company ID if provided
        const fetchedCourses = await fetchCourses(companyId);
        setCourses(fetchedCourses);
      } else if (currentUserProfile?.is_admin) {
        if (companyId) {
          // If company ID is provided, fetch only courses for that specific company
          const { data: companyCourses } = await supabase
            .from('company_courses')
            .select('course_id')
            .eq('empresa_id', companyId);
            
          if (!companyCourses?.length) {
            setCourses([]);
            setIsLoading(false);
            return;
          }
          
          const courseIds = companyCourses.map(cc => cc.course_id);
          
          const { data: courses } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);
            
          setCourses(courses || []);
        } else {
          // If no company ID provided, fetch courses for all companies the admin has access to
          const { data: userCompanies } = await supabase
            .from('user_empresa')
            .select('empresa_id')
            .eq('user_id', currentUserId);

          if (!userCompanies?.length) {
            setCourses([]);
            setIsLoading(false);
            return;
          }

          const companyIds = userCompanies.map(uc => uc.empresa_id);

          const { data: companyCourses } = await supabase
            .from('company_courses')
            .select('course_id')
            .in('empresa_id', companyIds);

          if (!companyCourses?.length) {
            setCourses([]);
            setIsLoading(false);
            return;
          }

          const courseIds = [...new Set(companyCourses.map(cc => cc.course_id))];

          const { data: courses } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);

          setCourses(courses || []);
        }
      } else {
        // Non-admin users see no courses
        setCourses([]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      const success = await deleteCourse(courseId);
      if (success) {
        loadCourses();
      }
    }
  };

  useEffect(() => {
    const handleSettingsCompanyChange = (e: CustomEvent) => {
      if (e.detail?.company?.id) {
        console.log(`Company changed in settings, updating courses for: ${e.detail.company.nome}`);
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

  useEffect(() => {
    const handleCourseDeleted = (e: CustomEvent) => {
      console.log('Course deleted event received, refreshing courses list');
      loadCourses();
    };

    window.addEventListener('course-deleted', handleCourseDeleted as EventListener);
    
    return () => {
      window.removeEventListener('course-deleted', handleCourseDeleted as EventListener);
    };
  }, []);

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
