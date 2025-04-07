
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, FileText, Play, ThumbsUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLessonData } from '@/hooks/useLessonData';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonComments } from '@/components/courses/LessonComments';
import { LessonNavigation } from '@/components/courses/LessonNavigation';
import { LessonActions } from '@/components/courses/LessonActions';

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
    // Rolar para o topo quando mudar de aula
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Aula não encontrada</h2>
            <p className="mb-6 text-muted-foreground">A aula que você está procurando não existe ou foi removida.</p>
            <Button asChild>
              <Link to={`/courses/${courseId}`}>Voltar para o curso</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderLessonContent = () => {
    switch (lesson.type.toLowerCase()) {
      case 'video':
        return (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {lesson.content ? (
              // Se for um URL do YouTube, incorporamos o vídeo
              lesson.content.includes('youtube.com') || lesson.content.includes('youtu.be') ? (
                <iframe
                  src={lesson.content.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title={lesson.title}
                ></iframe>
              ) : (
                // Se for um vídeo direto
                <video
                  src={lesson.content}
                  controls
                  className="w-full h-full"
                ></video>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Conteúdo do vídeo não disponível</p>
              </div>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content || 'Conteúdo não disponível' }} />
          </div>
        );
      case 'quiz':
        return (
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Quiz: {lesson.title}</h3>
            <p className="mb-4 text-muted-foreground">{lesson.content || 'Este quiz será implementado em breve'}</p>
          </div>
        );
      default:
        return (
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground">Conteúdo não disponível</p>
          </div>
        );
    }
  };

  const getLessonTypeIcon = () => {
    switch (lesson.type.toLowerCase()) {
      case 'video':
        return <Play className="h-4 w-4 mr-1" />;
      case 'text':
        return <FileText className="h-4 w-4 mr-1" />;
      case 'quiz':
        return <Play className="h-4 w-4 mr-1" />;
      default:
        return <Play className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o curso
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
        
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <div className="flex items-center mr-4">
            {getLessonTypeIcon()}
            <span className="capitalize">{lesson.type}</span>
          </div>
          
          {lesson.duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{lesson.duration}</span>
            </div>
          )}
          
          {lesson.completed && (
            <div className="flex items-center ml-4 text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Concluído</span>
            </div>
          )}
        </div>
        
        <Card className="mb-8 p-6 border border-border">
          {renderLessonContent()}
        </Card>
        
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
          <LessonComments lessonId={lesson.id} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPage;
