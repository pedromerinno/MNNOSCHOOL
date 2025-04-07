
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLessonData } from '@/hooks/useLessonData';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const { lesson, loading, markLessonCompleted } = useLessonData(lessonId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-8">
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Aula não encontrada</h2>
            <p className="mb-6">A aula que você está procurando não existe ou foi removida.</p>
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
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
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
                <p className="text-gray-500">Conteúdo do vídeo não disponível</p>
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
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Quiz: {lesson.title}</h3>
            <p className="mb-4">{lesson.content || 'Este quiz será implementado em breve'}</p>
          </div>
        );
      default:
        return (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p>Conteúdo não disponível</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to={`/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o curso
            </Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span className="capitalize mr-4">{lesson.type}</span>
          {lesson.duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{lesson.duration}</span>
            </div>
          )}
        </div>
        
        <Card className="mb-8 p-6">
          {renderLessonContent()}
        </Card>
        
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to={`/courses/${courseId}`}>Voltar para o curso</Link>
          </Button>
          
          <Button onClick={() => markLessonCompleted()}>
            Marcar como concluído
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPage;
