
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Play, Clock, FileText } from 'lucide-react';

export type Lesson = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  type: string;
  order_index: number;
  completed: boolean;
};

interface CourseLessonListProps {
  lessons: Lesson[];
  onStartLesson: (lessonId: string) => void;
}

export const CourseLessonList: React.FC<CourseLessonListProps> = ({ 
  lessons,
  onStartLesson
}) => {
  const getLessonIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <Play className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Conteúdo do Curso</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              className={`p-4 ${index !== 0 ? 'border-t border-border' : ''} ${
                lesson.completed ? 'bg-green-50/50 dark:bg-green-900/10' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {lesson.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">
                      {getLessonIcon(lesson.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-base">{lesson.title}</h3>
                  
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
                  onClick={() => onStartLesson(lesson.id)}
                  className="ml-2 flex-shrink-0"
                >
                  {lesson.completed ? "Revisar" : "Iniciar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
