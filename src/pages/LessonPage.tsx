
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useLessonData } from '@/hooks/useLessonData';
import { useAutoplayNavigation } from '@/hooks/lesson/useAutoplayNavigation';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LessonHeader } from '@/components/lessons/LessonHeader';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonActions } from '@/components/courses/LessonActions';
import { LessonNavigation } from '@/components/courses/LessonNavigation';
import { LessonComments } from '@/components/courses/LessonComments';
import { LessonSkeleton } from '@/components/lessons/LessonSkeleton';
import { LessonNotFound } from '@/components/lessons/LessonNotFound';
import { CourseDescription } from '@/components/courses/CourseDescription';
import { LessonPlaylist } from '@/components/lessons/LessonPlaylist';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const location = useLocation();
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);
  const { 
    lesson, 
    loading, 
    markLessonCompleted, 
    previousLesson, 
    nextLesson, 
    navigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson,
    completed
  } = useLessonData(currentLessonId);

  const {
    showAutoplayPrompt,
    handleVideoEnd,
    setShowAutoplayPrompt,
    cancelAutoplay
  } = useAutoplayNavigation(nextLesson, courseId);

  // Update current lesson ID when route params change
  useEffect(() => {
    if (lessonId !== currentLessonId) {
      setCurrentLessonId(lessonId);
    }
  }, [lessonId, currentLessonId]);

  // Handle scroll to top when changing lessons
  useEffect(() => {
    window.scrollTo(0, 0);
    setShowAutoplayPrompt(false);
  }, [currentLessonId, setShowAutoplayPrompt]);

  // Clean up autoplay on unmount
  useEffect(() => {
    return () => {
      cancelAutoplay();
    };
  }, [currentLessonId, cancelAutoplay]);

  // Handle lesson selection from playlist
  const handleLessonSelect = (selectedLessonId: string) => {
    setCurrentLessonId(selectedLessonId);
    navigateToLesson(selectedLessonId);
  };

  if (loading) {
    return <LessonSkeleton />;
  }

  if (!lesson) {
    return <LessonNotFound courseId={courseId} />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <LessonHeader lesson={lesson} courseId={courseId} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <LessonContent 
              lesson={lesson}
              onVideoEnd={handleVideoEnd}
              showAutoplayPrompt={showAutoplayPrompt}
              nextLessonTitle={nextLesson?.title}
            />
            
            <div className="max-w-full">
              <CourseDescription description={lesson.description || null} />
              
              <LessonActions
                completed={completed}
                onMarkCompleted={markLessonCompleted}
                likes={likes}
                userLiked={userLiked}
                onToggleLike={toggleLikeLesson}
              />
              
              <LessonNavigation
                previousLesson={previousLesson}
                nextLesson={nextLesson}
                onNavigate={handleLessonSelect}
              />
              
              <div className="mt-8">
                <LessonComments lessonId={lesson.id} />
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <LessonPlaylist
              lessons={lesson.course_lessons || []}
              currentLessonId={lesson.id}
              onLessonSelect={handleLessonSelect}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPage;
