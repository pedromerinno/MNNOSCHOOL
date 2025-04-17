
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Play, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Lesson = {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: string;
  course_id: string;
  order_index: number;
  duration?: string;
  completed?: boolean;
  course_description?: string | null;
};

interface CourseLessonListProps {
  lessons: Lesson[];
  onStartLesson: (lessonId: string) => void;
}

export const CourseLessonList: React.FC<CourseLessonListProps> = ({ 
  lessons,
  onStartLesson
}) => {
  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    switch (type.toLowerCase()) {
      case 'video':
        return <Play className="h-4 w-4 text-primary" />;
      case 'text':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'quiz':
        return <FileText className="h-4 w-4 text-primary" />;
      default:
        return <Play className="h-4 w-4 text-primary" />;
    }
  };

  // Sort lessons by order_index
  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card className="border border-border sticky top-4">
      <CardHeader className="bg-primary/5 pb-3">
        <CardTitle className="text-xl">Conteúdo do Curso</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedLessons.map((lesson) => (
            <div 
              key={lesson.id}
              className={cn(
                "p-4 hover:bg-muted/30 transition-colors",
                lesson.completed && "bg-green-50/50 dark:bg-green-900/10"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getLessonIcon(lesson.type, lesson.completed)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{lesson.title}</h4>
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="capitalize mr-2">{lesson.type}</span>
                    {lesson.duration && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{lesson.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant={lesson.completed ? "outline" : "default"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartLesson(lesson.id);
                  }}
                  className="ml-2 flex-shrink-0"
                >
                  {lesson.completed ? "Revisar" : "Iniciar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* If there are no lessons */}
        {lessons.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma lição disponível para este curso ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
