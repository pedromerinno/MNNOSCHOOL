
import { useState } from 'react';
import { createCourse, updateCourse } from '@/services/course';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { Course } from '@/components/admin/courses/types';

export const useCourseForm = (onSuccess: () => void) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedCourse) {
        // Update existing course
        await updateCourse(selectedCourse.id, data);
      } else {
        // Create new course with logging for debugging notification issues
        console.log('Creating new course with data:', {
          ...data,
          companyIds: data.companyIds || []
        });
        const courseId = await createCourse(data);
        console.log('Course created with ID:', courseId);
        
        // Garantir que o evento de notificação seja disparado
        if (courseId) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
          }, 500);
        }
      }

      setIsFormOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedCourse,
    setSelectedCourse,
    isFormOpen,
    setIsFormOpen,
    isSubmitting,
    handleFormSubmit
  };
};
