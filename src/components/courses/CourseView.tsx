
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseHeader } from './CourseHeader';
import { CourseHero } from './CourseHero';
import { CourseNotFound } from './CourseNotFound';
import { CourseLessonsSection } from './CourseLessonsSection';
import { CourseViewSkeleton } from './CourseViewSkeleton';
import { useCompanies } from '@/hooks/useCompanies';
import { CourseMainContent } from './view/CourseMainContent';
import { CourseDialogs } from './view/CourseDialogs';
import { useCourseView } from '@/hooks/course/useCourseView';
import { calculateTotalDuration } from '@/utils/durationUtils';

export const CourseView: React.FC = React.memo(() => {
  const { courseId } = useParams<{ courseId: string }>();
  const { userCompanies } = useCompanies();
  const navigate = useNavigate();
  
  const {
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
  } = useCourseView(courseId);

  // Memoize handlers to prevent unnecessary re-renders
  const handleCompanyChange = useMemo(() => {
    return () => {
      console.log('Company changed in CourseView, redirecting to my-courses page');
      navigate('/my-courses');
    };
  }, [navigate]);

  // Listen for company changes and redirect to courses page
  useEffect(() => {
    window.addEventListener('company-selected', handleCompanyChange);
    window.addEventListener('company-selector-changed', handleCompanyChange);
    window.addEventListener('company-changed', handleCompanyChange);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanyChange);
      window.removeEventListener('company-selector-changed', handleCompanyChange);
      window.removeEventListener('company-changed', handleCompanyChange);
    };
  }, [handleCompanyChange]);

  // Listen for course update events to refresh data
  useEffect(() => {
    const handleCourseUpdated = (event: CustomEvent) => {
      if (event.detail?.courseId === courseId) {
        console.log('Course updated event received, refreshing course data');
        refreshCourseData();
      }
    };

    window.addEventListener('course-updated', handleCourseUpdated as EventListener);
    
    return () => {
      window.removeEventListener('course-updated', handleCourseUpdated as EventListener);
    };
  }, [courseId, refreshCourseData]);

  // Memoize formatted duration
  const formattedDuration = useMemo(() => {
    return course ? calculateTotalDuration(course.lessons) : '0h';
  }, [course]);

  // Memoize initial form data
  const initialFormData = useMemo(() => {
    if (!course) return null;
    return {
      id: course.id,
      title: course.title,
      description: course.description || "",
      image_url: course.image_url || "",
      instructor: course.instructor || "",
      tags: course.tags || [],
      companyIds: courseCompanyIds,
    };
  }, [course, courseCompanyIds]);

  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (error || !course) {
    return <CourseNotFound />;
  }

  if (!initialFormData) {
    return <CourseViewSkeleton />;
  }

  return (
    <>
      <div className="w-full max-w-[1600px] mx-auto">
        <CourseHeader 
          title={course.title} 
          instructor={course.instructor} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
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
            
            <CourseMainContent
              totalDuration={formattedDuration}
              lessonCount={course.lessons?.length || 0}
              tags={course.tags}
              progress={course.progress}
              description={course.description}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              companyColor={companyColor}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <CourseLessonsSection
                isAdmin={isAdmin}
                showLessonManager={showLessonManager}
                setShowLessonManager={setShowLessonManager}
                courseId={course.id}
                courseTitle={course.title}
                lessons={course.lessons}
                startLesson={startLesson}
                refreshCourseData={refreshCourseData}
              />
            </div>
          </div>
        </div>
      </div>

      <CourseDialogs
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        initialFormData={initialFormData}
        handleCourseUpdate={handleCourseUpdate}
        isSubmitting={isSubmitting}
        userCompanies={userCompanies}
        showLessonManager={showLessonManager}
        setShowLessonManager={setShowLessonManager}
        courseId={course.id}
        courseTitle={course.title}
      />
    </>
  );
});
