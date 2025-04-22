import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessonNavigation } from './useLessonNavigation';
import { CourseHeader } from './CourseHeader';
import { CourseHero } from './CourseHero';
import { CourseNotFound } from './CourseNotFound';
import { CourseStatsBar } from './CourseStatsBar';
import { CourseProgressBox } from './CourseProgressBox';
import { CourseLessonsSection } from './CourseLessonsSection';
import { CourseViewSkeleton } from './CourseViewSkeleton';
import { CourseContent } from './CourseContent';
import { EditCourseDialog } from './EditCourseDialog';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { useCourseEdit } from '@/hooks/course/useCourseEdit';

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading, error, refreshCourseData } = useCourseData(courseId);
  const { startLesson } = useLessonNavigation(courseId);
  const [activeTab, setActiveTab] = useState<string>("description");
  const { selectedCompany, userCompanies } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  const [showLessonManager, setShowLessonManager] = useState(false);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isSubmitting,
    courseCompanyIds,
    handleEditCourse,
    handleCourseUpdate
  } = useCourseEdit(courseId);
  
  // Ensure data is refreshed once dialog closes (after an update)
  useEffect(() => {
    const handleCourseUpdated = (event: CustomEvent) => {
      if (event.detail?.courseId === courseId) {
        refreshCourseData();
      }
    };

    window.addEventListener('course-updated', handleCourseUpdated as EventListener);
    
    return () => {
      window.removeEventListener('course-updated', handleCourseUpdated as EventListener);
    };
  }, [courseId, refreshCourseData]);
  
  // Pre-load data when on course page to prevent any flickering
  useEffect(() => {
    if (courseId && !loading && !error) {
      // Keep data fresh by polling occasionally
      const refreshInterval = setInterval(() => {
        refreshCourseData();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [courseId, refreshCourseData, loading, error]);
  
  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (!course || error) {
    return <CourseNotFound />;
  }

  const initialFormData = {
    id: course.id,
    title: course.title,
    description: course.description || "",
    image_url: course.image_url || "",
    instructor: course.instructor || "",
    tags: course.tags || [],
    companyIds: courseCompanyIds,
  };

  const totalDuration = course.lessons?.reduce((total, lesson) => {
    const minutes = lesson.duration 
      ? parseInt(lesson.duration.replace(/[^0-9]/g, '')) 
      : 0;
    return total + minutes;
  }, 0) || 0;
  
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const formattedDuration = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes} min` : ''}` 
    : `${minutes} min`;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <CourseHeader 
        title={course.title} 
        instructor={course.instructor} 
      />
      
      <div className="mb-8">
        <CourseHero 
          imageUrl={course.image_url} 
          title={course.title}
          instructor={course.instructor || ""}
          favorite={course.favorite || false}
          courseId={course.id}
          firstLessonId={course.lessons?.[0]?.id}
          showEditButton={isAdmin}
          onEditCourse={handleEditCourse}
        />
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-8/12 space-y-8">
          <CourseStatsBar
            duration={formattedDuration}
            lessonCount={course.lessons?.length || 0}
            tags={course.tags}
          />

          <CourseProgressBox progress={course.progress} />

          <CourseContent 
            description={course.description}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            companyColor={companyColor}
          />
        </div>
        
        <CourseLessonsSection
          isAdmin={isAdmin}
          showLessonManager={showLessonManager}
          setShowLessonManager={setShowLessonManager}
          courseId={course.id}
          courseTitle={course.title}
          lessons={course.lessons}
          startLesson={startLesson}
        />
      </div>

      {/* Improved EditCourseDialog to prevent flickering */}
      <EditCourseDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={initialFormData}
        onSubmit={handleCourseUpdate}
        isSubmitting={isSubmitting}
        userCompanies={userCompanies}
      />

      <LessonManager
        courseId={course.id}
        courseTitle={course.title}
        open={showLessonManager}
        onClose={() => setShowLessonManager(false)}
      />
    </div>
  );
};
