
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Play, Clock } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo do Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lessons.map(lesson => (
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
                onClick={() => onStartLesson(lesson.id)}
                className="ml-2 flex-shrink-0"
              >
                {lesson.completed ? "Revisar" : "Iniciar"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
