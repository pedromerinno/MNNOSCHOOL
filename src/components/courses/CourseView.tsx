
import React from 'react';
import { useParams } from 'react-router-dom';
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

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { userCompanies } = useCompanies();
  
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

  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (!course || error) {
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
