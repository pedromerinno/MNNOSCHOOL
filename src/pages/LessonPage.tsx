import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLessonDataOptimized } from '@/hooks/lesson/useLessonDataOptimized';
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
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings, BookOpen } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useLessons } from '@/hooks/useLessons';
import { useCompanies } from '@/hooks/useCompanies';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const [showLessonManager, setShowLessonManager] = useState(false);
  const [localUpdates, setLocalUpdates] = useState<Record<string, any>>({});
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  // Use o hook otimizado
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
    refreshLessonData,
    isFromCache
  } = useLessonDataOptimized(lessonId);

  // Use lessons hook apenas para admin
  const { handleCreateLesson } = useLessons(isAdmin ? (courseId || '') : '');

  const {
    showAutoplayPrompt,
    handleVideoEnd,
    setShowAutoplayPrompt,
    cancelAutoplay
  } = useAutoplayNavigation(null, courseId);

  // Memoizar displayLesson para evitar re-renders
  const displayLesson = useMemo(() => {
    if (!lesson) return null;
    return {
      ...lesson,
      ...localUpdates
    };
  }, [lesson, localUpdates]);

  // Listen for lesson field updates
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

  // Listen for lesson updates
  useEffect(() => {
    const handleLessonUpdated = (event: CustomEvent) => {
      if (event.detail?.lessonId === lessonId) {
        console.log('Lesson updated, refreshing data');
        if (refreshLessonData) {
          refreshLessonData();
        }
      }
    };

    window.addEventListener('lesson-updated', handleLessonUpdated as EventListener);
    
    return () => {
      window.removeEventListener('lesson-updated', handleLessonUpdated as EventListener);
    };
  }, [lessonId, refreshLessonData]);

  // Scroll to top when changing lessons
  useEffect(() => {
    window.scrollTo(0, 0);
    setShowAutoplayPrompt(false);
    setLocalUpdates({}); // Limpar updates locais
  }, [lessonId, setShowAutoplayPrompt]);

  // Clean up autoplay
  useEffect(() => {
    return () => {
      cancelAutoplay();
    };
  }, [cancelAutoplay]);

  // Navegação otimizada
  const handleLessonSelect = (selectedLessonId: string) => {
    if (selectedLessonId === lessonId) return;
    
    console.log('Selecting lesson:', selectedLessonId);
    setLocalUpdates({});
    navigateToLesson(selectedLessonId);
  };

  const handleAddLesson = async (data: any) => {
    try {
      await handleCreateLesson(data);
      setShowLessonManager(false);
      window.dispatchEvent(new CustomEvent('course-updated', {
        detail: { courseId }
      }));
    } catch (error) {
      console.error("Error adding lesson:", error);
    }
  };

  // Loading otimizado - mostrar conteúdo se disponível
  if (loading && !lesson && !isFromCache) {
    return <LessonSkeleton />;
  }

  if (!lesson && !loading) {
    return <LessonNotFound courseId={courseId} />;
  }

  return (
    <>
      <DashboardLayout fullWidth>
        <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
          {/* Sidebar com loading otimizado */}
          <div className="lg:w-1/4 lg:min-h-full border-r border-border/60 bg-muted/20">
            <div className="fixed lg:w-[calc(25%-1px)] top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
              {/* Back to course button */}
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

              {/* Admin button */}
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
              
              {/* Playlist com loading otimizado */}
              <div className="p-4">
                <LessonPlaylist
                  lessons={displayLesson?.course_lessons || []}
                  currentLessonId={displayLesson?.id}
                  onLessonSelect={handleLessonSelect}
                  loading={loading && !isFromCache && !lesson}
                  companyColor={companyColor}
                />
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-1 p-6 lg:px-10 lg:py-8">
            {displayLesson && (
              <>
                <LessonHeader lesson={displayLesson} courseId={courseId} hideBackButton={true} />

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
              </>
            )}
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
