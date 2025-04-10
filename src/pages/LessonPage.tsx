
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, FileText, Play, ThumbsUp, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLessonData } from '@/hooks/useLessonData';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonComments } from '@/components/courses/LessonComments';
import { LessonNavigation } from '@/components/courses/LessonNavigation';
import { LessonActions } from '@/components/courses/LessonActions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);

  useEffect(() => {
    // Rolar para o topo quando mudar de aula
    window.scrollTo(0, 0);
    // Reset error state when changing lessons
    setVideoError(false);
    setVideoLoading(true);
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

  // Extrair o ID do vídeo do YouTube
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Converter URL para formato de incorporação seguro
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // Se já for uma URL de embed, transformar para nocookie
    if (url.includes('youtube.com/embed/')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    
    // YouTube: converter URL padrão para formato nocookie
    if (url.includes('youtube.com/watch')) {
      const videoId = getYoutubeVideoId(url);
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }
    
    // YouTube: converter URL curta para formato nocookie
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }
    
    // Se não for YouTube, retornar a URL original
    return url;
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
    setVideoError(false);
  };

  const renderLessonContent = () => {
    switch (lesson.type.toLowerCase()) {
      case 'video':
        const videoUrl = lesson.content;
        const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
        const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
        const videoId = isYouTube ? getYoutubeVideoId(videoUrl || '') : null;
        
        return (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {lesson.content ? (
              <>
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="animate-spin h-8 w-8 border-t-2 border-primary border-r-2 rounded-full"></div>
                  </div>
                )}
                
                {videoError && isYouTube ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">A conexão com YouTube foi recusada</h3>
                    <p className="text-muted-foreground mb-4">
                      Isso pode ocorrer devido a bloqueios de rede ou restrições de privacidade.
                    </p>
                    <Button asChild variant="outline">
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assistir diretamente no YouTube
                      </a>
                    </Button>
                  </div>
                ) : videoError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Erro ao carregar o vídeo</h3>
                    <p className="text-muted-foreground mb-4">
                      Não foi possível carregar o conteúdo do vídeo.
                    </p>
                  </div>
                ) : null}
                
                {embedUrl && (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    style={{ display: videoError ? 'none' : 'block' }}
                    allowFullScreen
                    title={lesson.title}
                    onError={handleVideoError}
                    onLoad={handleVideoLoad}
                  ></iframe>
                )}
              </>
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
