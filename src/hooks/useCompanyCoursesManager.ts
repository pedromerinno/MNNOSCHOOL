
import { useState } from 'react';
import { Course } from '@/components/admin/courses/types';

export const useCompanyCoursesManager = () => {
  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState(false);
  const [selectedCourseForCompany, setSelectedCourseForCompany] = useState<Course | null>(null);

  return {
    isCompanyManagerOpen,
    setIsCompanyManagerOpen,
    selectedCourseForCompany,
    setSelectedCourseForCompany
  };
};
