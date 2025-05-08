
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Lesson } from '@/components/courses/CourseLessonList';

interface LessonHeaderProps {
  lesson: Lesson;
  courseId: string | undefined;
  hideBackButton?: boolean;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  lesson, 
  courseId,
  hideBackButton = false 
}) => {
  if (!lesson) return null;

  return (
    <>
      {!hideBackButton && (
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o curso
          </Link>
        </Button>
      )}
      
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
    </>
  );
};
