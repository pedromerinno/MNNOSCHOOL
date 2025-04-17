
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLessonData } from '@/hooks/useLessonData';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LessonHeader } from '@/components/lessons/LessonHeader';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonActions } from '@/components/courses/LessonActions';
import { LessonNavigation } from '@/components/courses/LessonNavigation';
import { LessonComments } from '@/components/courses/LessonComments';
import { LessonSkeleton } from '@/components/lessons/LessonSkeleton';
import { LessonNotFound } from '@/components/lessons/LessonNotFound';
import { CourseDescription } from '@/components/courses/CourseDescription';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const { 
    lesson, 
    loading, 
    markLessonCompleted, 
    previousLesson, 
    nextLesson, 
    navigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson
  } = useLessonData(lessonId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (loading) {
    return <LessonSkeleton />;
  }

  if (!lesson) {
    return <LessonNotFound courseId={courseId} />;
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <LessonHeader lesson={lesson} courseId={courseId} />
        
        <LessonContent lesson={lesson} />
        
        <div className="max-w-4xl mx-auto">
          <LessonActions
            completed={lesson.completed}
            onMarkCompleted={markLessonCompleted}
            likes={likes}
            userLiked={userLiked}
            onToggleLike={toggleLikeLesson}
          />
          
          <LessonNavigation
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            onNavigate={navigateToLesson}
          />
          
          <div className="mt-8">
            <CourseDescription description={lesson.course_description} />
          </div>
          
          <div className="mt-8">
            <LessonComments lessonId={lesson.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPage;
