
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Course } from './types';
import { fetchCourses, deleteCourse } from '@/services/courseService';
import { useCourseForm } from '@/hooks/useCourseForm';
import { useCompanyCoursesManager } from '@/hooks/useCompanyCoursesManager';

export const useCourses = (companyId?: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use our extracted hooks
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
    setIsCompanyManagerOpen, 
    selectedCourseForCompany, 
    setSelectedCourseForCompany 
  } = useCompanyCoursesManager();

  const loadCourses = async () => {
    setIsLoading(true);
    const data = await fetchCourses(companyId);
    setCourses(data);
    setIsLoading(false);
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
