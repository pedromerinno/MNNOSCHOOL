
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLessonData } from '@/hooks/useLessonData';
import { useAutoplayNavigation } from '@/hooks/lesson/useAutoplayNavigation';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LessonHeader } from '@/components/lessons/LessonHeader';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonActions } from '@/components/courses/LessonActions';
import { LessonComments } from '@/components/courses/LessonComments';
import { LessonSkeleton } from '@/components/lessons/LessonSkeleton';
import { LessonNotFound } from '@/components/lessons/LessonNotFound';
import { CourseDescription } from '@/components/courses/CourseDescription';
import { LessonPlaylist } from '@/components/lessons/LessonPlaylist';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const [localLoading, setLocalLoading] = useState(false);
  
  // Use useLessonData with URL parameter
  const { 
    lesson, 
    loading, 
    error,
    markLessonCompleted, 
    navigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson,
    completed
  } = useLessonData(lessonId);

  const {
    showAutoplayPrompt,
    handleVideoEnd,
    setShowAutoplayPrompt,
    cancelAutoplay
  } = useAutoplayNavigation(null, courseId); // Passing null to disable autoplay functionality

  // Handle scroll to top when changing lessons
  useEffect(() => {
    window.scrollTo(0, 0);
    setShowAutoplayPrompt(false);
  }, [lessonId, setShowAutoplayPrompt]);

  // Clean up autoplay on unmount
  useEffect(() => {
    return () => {
      cancelAutoplay();
    };
  }, [cancelAutoplay]);

  // Improved lesson selection handling
  const handleLessonSelect = (selectedLessonId: string) => {
    if (selectedLessonId === lessonId) return;
    
    setLocalLoading(true);
    navigateToLesson(selectedLessonId);
    
    // Reset local loading state after a short delay
    setTimeout(() => {
      setLocalLoading(false);
    }, 300);
  };

  if (loading || localLoading) {
    return <LessonSkeleton />;
  }

  if (!lesson) {
    return <LessonNotFound courseId={courseId} />;
  }

  return (
    <DashboardLayout fullWidth>
      <div className="mx-auto px-0 py-6 max-w-full">
        <div className="px-6">
          <LessonHeader lesson={lesson} courseId={courseId} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <LessonContent 
              lesson={lesson}
              onVideoEnd={handleVideoEnd}
              showAutoplayPrompt={false}
            />
            
            <div className="px-6 max-w-full">
              <CourseDescription description={lesson.description || null} />
              
              <LessonActions
                completed={completed}
                onMarkCompleted={markLessonCompleted}
                likes={likes}
                userLiked={userLiked}
                onToggleLike={toggleLikeLesson}
              />
              
              <div className="mt-8">
                <LessonComments lessonId={lesson.id} />
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start px-6 lg:px-0">
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
