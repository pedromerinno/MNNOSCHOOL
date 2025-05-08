
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
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const [localLoading, setLocalLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  
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
  } = useAutoplayNavigation(null, courseId);

  // Handle scroll to top when changing lessons
  useEffect(() => {
    window.scrollTo(0, 0);
    setShowAutoplayPrompt(false);
  }, [lessonId, setShowAutoplayPrompt]);

  // Update current lesson when the lesson data changes
  useEffect(() => {
    if (lesson && !loading) {
      setCurrentLesson(lesson);
      setIsTransitioning(false);
      setLocalLoading(false);
    }
  }, [lesson, loading]);

  // Clean up autoplay on unmount
  useEffect(() => {
    return () => {
      cancelAutoplay();
    };
  }, [cancelAutoplay]);

  // Improved lesson selection handling with smoother transitions
  const handleLessonSelect = (selectedLessonId: string) => {
    if (selectedLessonId === lessonId) return;
    
    setIsTransitioning(true);
    navigateToLesson(selectedLessonId);
  };

  // If we have a current lesson and are transitioning, show that instead of skeleton
  const shouldShowContent = currentLesson && (!loading || isTransitioning);
  
  if (loading && !shouldShowContent) {
    return <LessonSkeleton />;
  }

  if (!lesson && !currentLesson && !isTransitioning) {
    return <LessonNotFound courseId={courseId} />;
  }

  // Use either the current loaded lesson or the previous lesson during transition
  const displayLesson = isTransitioning ? currentLesson : lesson;

  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        {/* Sidebar fixed on left side */}
        <div className="lg:w-1/4 lg:min-h-full border-r border-border">
          <div className="fixed lg:w-[calc(25%-1px)] top-[80px] h-[calc(100vh-80px)] overflow-y-auto pb-6">
            {/* Back to course button moved to top of sidebar */}
            <div className="px-4 pt-6 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => window.location.href = `/courses/${courseId}`}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar para o Curso
              </Button>
            </div>
            
            <div className="px-4">
              <LessonPlaylist
                lessons={displayLesson?.course_lessons || []}
                currentLessonId={displayLesson?.id}
                onLessonSelect={handleLessonSelect}
                loading={loading}
              />
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 p-6 lg:px-8">
          <div className={isTransitioning ? "opacity-70 pointer-events-none transition-opacity" : ""}>
            <LessonHeader lesson={displayLesson} courseId={courseId} hideBackButton={true} />

            {/* Actions in a single row above the video */}
            <LessonActions
              completed={completed}
              onMarkCompleted={markLessonCompleted}
              likes={likes}
              userLiked={userLiked}
              onToggleLike={toggleLikeLesson}
              lessonType={displayLesson?.type}
              lessonDuration={displayLesson?.duration}
            />
            
            <div className="mt-6 space-y-8">
              {/* Video container */}
              <div className="rounded-lg overflow-hidden">
                <LessonContent 
                  lesson={displayLesson}
                  onVideoEnd={handleVideoEnd}
                  showAutoplayPrompt={false}
                />
              </div>
              
              <CourseDescription description={displayLesson?.description || null} />
              
              <div className="mt-8">
                <LessonComments lessonId={displayLesson?.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPage;
