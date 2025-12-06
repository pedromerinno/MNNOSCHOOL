
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLessonDataOptimized } from '@/hooks/lesson/useLessonDataOptimized';
import { useAutoplayNavigation } from '@/hooks/lesson/useAutoplayNavigation';
import { LessonLayout } from '@/components/lessons/LessonLayout';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonActions } from '@/components/courses/LessonActions';
import { LessonNotFound } from '@/components/lessons/LessonNotFound';
import { CourseDescription } from '@/components/courses/CourseDescription';
import { LessonSidebar } from '@/components/lessons/LessonSidebar';
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { LessonPageHeader } from '@/components/lessons/LessonPageHeader';
import { useLessons } from '@/hooks/useLessons';
import { useCompanies } from '@/hooks/useCompanies';
import { useIsAdmin } from '@/hooks/company/useIsAdmin';
import { Preloader } from '@/components/ui/Preloader';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const [showLessonManager, setShowLessonManager] = useState(false);
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
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
      <LessonLayout>
        <LessonNotFound courseId={courseId} />
      </LessonLayout>
    );
  }

  // Se não tem lesson mas está carregando, mostrar preloader
  if (!lesson && loading) {
    return <Preloader autoHide={false} />;
  }

  return (
    <LessonLayout>
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar esquerda no estilo da página escola */}
          <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start lg:h-[calc(100vh-4rem)]">
            {/* Botão voltar ao curso */}
            <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-all duration-200 gap-2 h-10" 
                onClick={() => courseId && navigate(`/courses/${courseId}`)}
              >
                <ChevronLeft className="h-4 w-4" />
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Voltar ao Curso</span>
              </Button>
            </div>
            
            {/* Sidebar com scroll interno */}
            <div className="flex-1 min-h-0">
              <LessonSidebar
                lessons={lesson?.course_lessons || []}
                currentLessonId={lesson?.id || ''}
                courseId={courseId}
                courseTitle={lesson?.course_title}
                companyColor={companyColor}
                isAdmin={isAdmin}
                onManageLessons={() => setShowLessonManager(true)}
              />
            </div>
          </div>
          
          {/* Conteúdo principal - vídeo grande */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header com breadcrumbs */}
            <LessonPageHeader
              courseTitle={lesson?.course_title}
              lessonTitle={lesson?.title}
              courseId={courseId}
            />
            
            {/* Header da aula */}
            <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-sm p-4 lg:p-6 border border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl lg:text-4xl font-bold leading-tight break-words">
                    {lesson?.title}
                  </h1>
                </div>

                <LessonActions
                  completed={completed}
                  onMarkCompleted={markLessonCompleted}
                  likes={likes}
                  userLiked={userLiked}
                  onToggleLike={toggleLikeLesson}
                  lessonType={lesson?.type}
                  lessonDuration={lesson?.duration}
                />
              </div>
            </div>

            {/* Vídeo - agora maior */}
            <div className="rounded-xl overflow-hidden shadow-lg bg-black">
              <LessonContent 
                lesson={lesson}
                onVideoEnd={handleVideoEnd}
                showAutoplayPrompt={false}
              />
            </div>
            
            {/* Descrição */}
            <CourseDescription 
              description={lesson?.description || null} 
              lessonId={lesson?.id}
            />
            
            {/* Espaçamento no final */}
            <div className="pb-8 lg:pb-12"></div>
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
    </LessonLayout>
  );
};

export default LessonPage;
