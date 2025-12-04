
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseHeader } from './CourseHeader';
import { CourseHero } from './CourseHero';
import { CourseNotFound } from './CourseNotFound';
import { CourseLessonsSection } from './CourseLessonsSection';
import { PagePreloader } from '@/components/ui/PagePreloader';
import { useCompanies } from '@/hooks/useCompanies';
import { CourseMainContent } from './view/CourseMainContent';
import { CourseDialogs } from './view/CourseDialogs';
import { useCourseView } from '@/hooks/course/useCourseView';
import { calculateTotalDuration } from '@/utils/durationUtils';

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { userCompanies, selectedCompany } = useCompanies();
  const navigate = useNavigate();
  
  console.log(`[CourseView] Rendering for courseId: ${courseId}`);
  
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

  // Listen for company changes and redirect to courses page
  useEffect(() => {
    const handleCompanyChange = () => {
      console.log('Company changed in CourseView, redirecting to courses page');
      navigate('/courses');
    };

    window.addEventListener('company-selected', handleCompanyChange);
    window.addEventListener('company-selector-changed', handleCompanyChange);
    window.addEventListener('company-changed', handleCompanyChange);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanyChange);
      window.removeEventListener('company-selector-changed', handleCompanyChange);
      window.removeEventListener('company-changed', handleCompanyChange);
    };
  }, [navigate]);

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

  console.log(`[CourseView] State - loading: ${loading}, course: ${course?.title || 'none'}, error: ${error?.message || 'none'}`);

  if (loading) {
    return <PagePreloader />;
  }

  if (error || !course) {
    console.log(`[CourseView] Showing CourseNotFound - error: ${error?.message}, course: ${course}`);
    return <CourseNotFound />;
  }

  const formattedDuration = calculateTotalDuration(course.lessons);

  const initialFormData = {
    id: course.id,
    title: course.title,
    description: course.description || "",
    image_url: course.image_url || "",
    instructor: course.instructor || "",
    tags: course.tags || [],
    companyIds: courseCompanyIds,
  };

  return (
    <div className="container max-w-8xl mx-auto px-4 py-8">
      <CourseHeader 
        title={course.title} 
        instructor={course.instructor} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {/* Course Hero with contained width */}
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
          
          {/* Course content now contained within the hero section's width */}
          <div className="mt-8">
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
        </div>
        
        <div className="lg:col-span-1">
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
    </div>
  );
};
