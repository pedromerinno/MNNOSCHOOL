
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
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        {/* Sidebar moved to left side and made full height and fixed */}
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
                lessons={lesson.course_lessons || []}
                currentLessonId={lesson.id}
                onLessonSelect={handleLessonSelect}
                loading={loading}
              />
            </div>
          </div>
        </div>
        
        {/* Content area moved to right side with padding */}
        <div className="flex-1 p-6 lg:px-8">
          <LessonHeader lesson={lesson} courseId={courseId} hideBackButton={true} />
          
          <div className="mt-6 space-y-8">
            {/* Added padding to video container */}
            <div className="rounded-lg overflow-hidden">
              <LessonContent 
                lesson={lesson}
                onVideoEnd={handleVideoEnd}
                showAutoplayPrompt={false}
              />
            </div>
            
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
      </div>
    </DashboardLayout>
  );
};

export default LessonPage;
