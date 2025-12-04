
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessonDataOptimized } from '@/hooks/lesson/useLessonDataOptimized';
import { useAutoplayNavigation } from '@/hooks/lesson/useAutoplayNavigation';
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { LessonHeader } from '@/components/lessons/LessonHeader';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonActions } from '@/components/courses/LessonActions';
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
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  console.log('📍 LessonPage: Renderizando com lessonId:', lessonId, ', courseId:', courseId);
  
  // Use o hook otimizado
  const { 
    lesson, 
    loading, 
    error,
    markLessonCompleted, 
    likes,
    userLiked,
    toggleLikeLesson,
    completed,
    refreshLessonData
  } = useLessonDataOptimized(lessonId);

  // Use lessons hook apenas para admin - com guard para evitar chamadas desnecessárias
  const { handleCreateLesson } = useLessons(isAdmin && courseId ? courseId : '');

  const {
    showAutoplayPrompt,
    handleVideoEnd,
    setShowAutoplayPrompt,
    cancelAutoplay
  } = useAutoplayNavigation(null, courseId);

  // Memoize company change handler to prevent recreating on every render
  const handleCompanyChange = useMemo(() => {
    return () => navigate('/courses');
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

  // Listen for lesson data refresh events from lesson manager
  useEffect(() => {
    const handleLessonDataRefresh = (event: CustomEvent) => {
      if (event.detail?.courseId === courseId) {
        console.log('🔄 Lesson data refresh event received, refreshing lesson data');
        refreshLessonData();
      }
    };

    window.addEventListener('lesson-data-refresh', handleLessonDataRefresh as EventListener);
    
    return () => {
      window.removeEventListener('lesson-data-refresh', handleLessonDataRefresh as EventListener);
    };
  }, [courseId, refreshLessonData]);

  // Scroll to top when changing lessons - apenas quando lessonId muda
  useEffect(() => {
    if (lessonId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowAutoplayPrompt(false);
    }
  }, [lessonId, setShowAutoplayPrompt]);

  // Clean up autoplay apenas no unmount
  useEffect(() => {
    return () => {
      cancelAutoplay();
    };
  }, [cancelAutoplay]);

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
  
  // Se não tem lesson e não está carregando, mostrar not found
  if (!lesson && !loading) {
    return (
      <>
        <MainNavigationMenu />
        <LessonNotFound courseId={courseId} />
      </>
    );
  }

  // Se não tem lesson mas está carregando, mostrar uma página básica sem preloader
  if (!lesson) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando aula...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
        <div className="flex flex-col lg:flex-row w-full flex-1">
          {/* Sidebar */}
          <div className="lg:w-1/4 lg:min-h-full border-r border-border/60 bg-muted/20">
            <div className="lg:w-[calc(25%-1px)] lg:fixed top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
              {/* Back to course button */}
              <div className="p-6 pb-4 border-b border-border/40">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-all duration-200 gap-2 h-10" 
                  style={{
                    '--hover-color': companyColor
                  } as React.CSSProperties}
                  onClick={() => navigate(`/courses/${courseId}`)}
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
              
              {/* Playlist */}
              <div className="p-4">
                <LessonPlaylist
                  lessons={lesson?.course_lessons || []}
                  currentLessonId={lesson?.id || ''}
                  onLessonSelect={() => {}} // Not used anymore
                  loading={false} // Never loading here since we have lesson data
                  companyColor={companyColor}
                  courseId={courseId}
                />
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-1 p-6 lg:px-10 lg:py-8">
            <LessonHeader lesson={lesson} courseId={courseId} hideBackButton={true} />

            <LessonActions
              completed={completed}
              onMarkCompleted={markLessonCompleted}
              likes={likes}
              userLiked={userLiked}
              onToggleLike={toggleLikeLesson}
              lessonType={lesson?.type}
              lessonDuration={lesson?.duration}
            />
            
            <div className="mt-8 space-y-10">
              <div className="rounded-xl overflow-hidden shadow-sm">
                <LessonContent 
                  lesson={lesson}
                  onVideoEnd={handleVideoEnd}
                  showAutoplayPrompt={false}
                />
              </div>
              
              <CourseDescription 
                description={lesson?.description || null} 
                lessonId={lesson?.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Manager Dialog */}
      {isAdmin && (
        <LessonManager
          courseId={courseId || ''}
          courseTitle={lesson?.course_title || 'Curso'}
          open={showLessonManager}
          onClose={() => setShowLessonManager(false)}
        />
      )}
    </>
  );
};

export default LessonPage;
