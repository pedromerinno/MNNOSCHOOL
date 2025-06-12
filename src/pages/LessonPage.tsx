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
import { LessonFormSheet } from '@/components/admin/courses/LessonFormSheet';
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings, BookOpen } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useLessons } from '@/hooks/useLessons';
import { useCompanies } from '@/hooks/useCompanies';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const [localLoading, setLocalLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<string, any>>({});
  const [showLessonManager, setShowLessonManager] = useState(false);
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
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
    completed,
    refreshLessonData
  } = useLessonData(lessonId);

  // Use lessons hook for admin functionality
  const { handleCreateLesson, isSubmitting } = useLessons(courseId || '');

  const {
    showAutoplayPrompt,
    handleVideoEnd,
    setShowAutoplayPrompt,
    cancelAutoplay
  } = useAutoplayNavigation(null, courseId);

  // Listen for lesson field update events to update data locally
  useEffect(() => {
    const handleLessonFieldUpdated = (event: CustomEvent) => {
      const { lessonId: updatedLessonId, field, value } = event.detail;
      
      if (updatedLessonId === lessonId) {
        console.log('Updating lesson field locally:', field, value);
        setLocalUpdates(prev => ({
          ...prev,
          [field]: value
        }));
      }
    };

    window.addEventListener('lesson-field-updated', handleLessonFieldUpdated as EventListener);
    
    return () => {
      window.removeEventListener('lesson-field-updated', handleLessonFieldUpdated as EventListener);
    };
  }, [lessonId]);

  // Listen for lesson update events to refresh data
  useEffect(() => {
    const handleLessonUpdated = (event: CustomEvent) => {
      if (event.detail?.lessonId === lessonId) {
        console.log('Lesson updated event received, refreshing lesson data');
        // Force a refresh of the lesson data
        window.location.reload();
      }
    };

    window.addEventListener('lesson-updated', handleLessonUpdated as EventListener);
    
    return () => {
      window.removeEventListener('lesson-updated', handleLessonUpdated as EventListener);
    };
  }, [lessonId]);

  // Listen for course update events to refresh lesson data and playlist
  useEffect(() => {
    const handleCourseUpdated = (event: CustomEvent) => {
      if (event.detail?.courseId === courseId) {
        console.log('Course updated event received, refreshing lesson data and playlist');
        // Refresh the lesson data to update the playlist
        if (refreshLessonData) {
          refreshLessonData();
        }
      }
    };

    window.addEventListener('course-updated', handleCourseUpdated as EventListener);
    
    return () => {
      window.removeEventListener('course-updated', handleCourseUpdated as EventListener);
    };
  }, [courseId, refreshLessonData]);

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
      // Clear local updates when new lesson data arrives
      setLocalUpdates({});
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
    setLocalUpdates({}); // Clear local updates when changing lessons
    navigateToLesson(selectedLessonId);
  };

  const handleAddLesson = async (data: any) => {
    try {
      await handleCreateLesson(data);
      setShowLessonManager(false);
      // Refresh the lesson list by dispatching a course update event
      window.dispatchEvent(new CustomEvent('course-updated', {
        detail: { courseId }
      }));
    } catch (error) {
      console.error("Error adding lesson:", error);
    }
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
  // Apply local updates on top of the base lesson data
  const baseLesson = isTransitioning ? currentLesson : lesson || currentLesson;
  const displayLesson = baseLesson ? {
    ...baseLesson,
    ...localUpdates
  } : null;

  return (
    <>
      <DashboardLayout fullWidth>
        <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
          {/* Improved Sidebar with company color styling */}
          <div className="lg:w-1/4 lg:min-h-full border-r border-border/60 bg-muted/20">
            <div className="fixed lg:w-[calc(25%-1px)] top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
              {/* Back to course button with company color accent */}
              <div className="p-6 pb-4 border-b border-border/40">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-all duration-200 gap-2 h-10" 
                  style={{
                    '--hover-color': companyColor
                  } as React.CSSProperties}
                  onClick={() => window.location.href = `/courses/${courseId}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Voltar ao Curso</span>
                </Button>
              </div>

              {/* Manage Lessons button for admins with company color styling */}
              {isAdmin && (
                <div className="px-6 py-4 border-b border-border/40">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start gap-2 transition-all duration-200 shadow-sm h-10" 
                    style={{
                      borderColor: `${companyColor}20`,
                      color: companyColor,
                      '--hover-bg': `${companyColor}10`,
                      '--hover-border': `${companyColor}40`
                    } as React.CSSProperties}
                    onClick={() => setShowLessonManager(true)}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Gerenciar Aulas</span>
                  </Button>
                </div>
              )}
              
              {/* Lesson playlist with company color */}
              <div className="px-3 py-2">
                <LessonPlaylist
                  lessons={displayLesson?.course_lessons || []}
                  currentLessonId={displayLesson?.id}
                  onLessonSelect={handleLessonSelect}
                  loading={loading}
                  companyColor={companyColor}
                />
              </div>
            </div>
          </div>
          
          {/* Content area with better spacing */}
          <div className="flex-1 p-6 lg:px-10 lg:py-8">
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
              
              <div className="mt-8 space-y-10">
                {/* Video container */}
                <div className="rounded-xl overflow-hidden shadow-sm">
                  <LessonContent 
                    lesson={displayLesson}
                    onVideoEnd={handleVideoEnd}
                    showAutoplayPrompt={false}
                  />
                </div>
                
                <CourseDescription 
                  description={displayLesson?.description || null} 
                  lessonId={displayLesson?.id}
                />
                
                <div className="mt-10">
                  <LessonComments lessonId={displayLesson?.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Lesson Manager Dialog */}
      {isAdmin && (
        <LessonManager
          courseId={courseId || ''}
          courseTitle={displayLesson?.course_title || 'Curso'}
          open={showLessonManager}
          onClose={() => setShowLessonManager(false)}
        />
      )}
    </>
  );
};

export default LessonPage;
