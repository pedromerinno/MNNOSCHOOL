
import { useState } from 'react';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessonNavigation } from '@/components/courses/useLessonNavigation';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseEdit } from '@/hooks/course/useCourseEdit';
import { useCourseRealtime } from '@/hooks/course/useCourseRealtime';

export const useCourseView = (courseId: string | undefined) => {
  const [activeTab, setActiveTab] = useState<string>("description");
  const [showLessonManager, setShowLessonManager] = useState(false);
  
  const { course, loading, error, refreshCourseData } = useCourseData(courseId);
  const { startLesson } = useLessonNavigation(courseId);
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isSubmitting,
    courseCompanyIds,
    handleEditCourse,
    handleCourseUpdate
  } = useCourseEdit(courseId);

  // Setup real-time subscription for course data updates
  useCourseRealtime(courseId, refreshCourseData);

  return {
    course,
    loading,
    error,
    activeTab,
    setActiveTab,
    showLessonManager,
    setShowLessonManager,
    startLesson,
    isAdmin,
    companyColor,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isSubmitting,
    courseCompanyIds,
    handleEditCourse,
    handleCourseUpdate,
    refreshCourseData
  };
};
