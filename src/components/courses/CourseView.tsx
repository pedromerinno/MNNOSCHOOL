
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, CheckCircle, Clock, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  type: string;
  order_index: number;
  completed: boolean;
};

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  instructor: string | null;
  lessons: Lesson[];
  progress: number;
  completed: boolean;
};

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        
        // Fetch the course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select(`
            id, 
            title, 
            description, 
            image_url, 
            instructor
          `)
          .eq('id', courseId)
          .single();
        
        if (courseError) {
          throw courseError;
        }
        
        // Fetch the lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            id, 
            title, 
            description, 
            duration, 
            type, 
            order_index
          `)
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
        
        if (lessonsError) {
          throw lessonsError;
        }
        
        // Fetch user progress for lessons
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data: lessonProgressData, error: lessonProgressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', userId || '');
        
        if (lessonProgressError) {
          console.error('Error fetching lesson progress:', lessonProgressError);
        }
        
        // Fetch user progress for this course
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('progress, completed')
          .eq('course_id', courseId)
          .eq('user_id', userId || '')
          .maybeSingle();
        
        if (progressError) {
          console.error('Error fetching progress:', progressError);
        }
        
        // Format the lessons
        const formattedLessons: Lesson[] = lessonsData.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          type: lesson.type,
          order_index: lesson.order_index,
          completed: lessonProgressData?.some(progress => 
            progress.lesson_id === lesson.id && progress.completed
          ) || false
        }));
        
        // Calculate progress if not available
        let progress = 0;
        let completed = false;
        
        if (progressData) {
          progress = progressData.progress;
          completed = progressData.completed;
        } else {
          // Calculate progress based on completed lessons
          const completedLessons = formattedLessons.filter(lesson => lesson.completed).length;
          if (formattedLessons.length > 0) {
            progress = Math.round((completedLessons / formattedLessons.length) * 100);
          }
          completed = progress === 100;
        }
        
        setCourse({
          ...courseData,
          lessons: formattedLessons,
          progress,
          completed
        });
        
      } catch (error: any) {
        console.error('Error fetching course:', error);
        toast({
          title: 'Erro ao carregar curso',
          description: error.message || 'Ocorreu um erro ao buscar os dados do curso',
          variant: 'destructive',
        });
        navigate('/courses'); // Redirect back to courses page on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, navigate, toast]);

  const startLesson = async (lessonId: string) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Mark the lesson as started
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: false,
          last_accessed: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Navigate to the lesson
      navigate(`/courses/${courseId}/lessons/${lessonId}`);
      
    } catch (error: any) {
      console.error('Error starting lesson:', error);
      toast({
        title: 'Erro ao iniciar aula',
        description: error.message || 'Ocorreu um erro ao iniciar a aula',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Button>
        
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <div>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Button>
        
        <h1 className="text-2xl font-semibold mb-4">Curso não encontrado</h1>
        <p className="mb-8">O curso que você está procurando não existe ou não está disponível para você.</p>
        
        <Button onClick={() => navigate('/courses')}>
          Ver todos os cursos
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/courses')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      {course.instructor && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Instrutor: {course.instructor}
        </p>
      )}
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {course.image_url ? (
            <img 
              src={course.image_url} 
              alt={course.title} 
              className="w-full h-64 object-cover rounded-md mb-6" 
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-md mb-6">
              <Book className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Sobre o Curso</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {course.description || 'Nenhuma descrição disponível.'}
            </p>
          </div>
          
          {course.progress > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Seu Progresso</h2>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {course.progress}% completo
              </p>
            </div>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.lessons.map(lesson => (
                  <div 
                    key={lesson.id}
                    className={`p-3 rounded-md border flex items-start ${
                      lesson.completed ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="mr-3 mt-1">
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Play className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{lesson.title}</h3>
                      
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="capitalize mr-2">{lesson.type}</span>
                        {lesson.duration && (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{lesson.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant={lesson.completed ? "outline" : "default"}
                      size="sm"
                      onClick={() => startLesson(lesson.id)}
                      className="ml-2 flex-shrink-0"
                    >
                      {lesson.completed ? "Revisar" : "Iniciar"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
