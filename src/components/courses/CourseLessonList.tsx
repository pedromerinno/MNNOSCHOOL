
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  duration?: string | null;
  type: string;
  order_index?: number;
  course_id?: string;
  completed?: boolean;
  content?: string | null;
  course_description?: string | null;
  course_lessons?: Array<{
    id: string;
    title: string;
    type: string;
    duration?: string | null;
    completed?: boolean;
    order_index?: number;
  }>;
}

interface CourseLessonListProps {
  lessons: Lesson[];
  courseId: string;
  onSelectLesson?: (lessonId: string) => void;
  onStartLesson?: (lessonId: string) => Promise<void>;
}

export const CourseLessonList: React.FC<CourseLessonListProps> = ({
  lessons,
  courseId,
  onSelectLesson,
  onStartLesson
}) => {
  const navigate = useNavigate();
  
  const handleLessonClick = (lessonId: string) => {
    if (onSelectLesson) {
      onSelectLesson(lessonId);
    } else if (onStartLesson) {
      onStartLesson(lessonId);
    } else {
      navigate(`/courses/${courseId}/lessons/${lessonId}`);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-xl font-bold">Aulas do Curso</h3>
      <Separator />
      
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <div 
            key={lesson.id}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => handleLessonClick(lesson.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {lesson.completed ? (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {index + 1}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium">{lesson.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{lesson.type}</span>
                    {lesson.duration && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{lesson.duration}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="rounded-full">
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
