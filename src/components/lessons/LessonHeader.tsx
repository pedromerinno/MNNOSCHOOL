
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, FileText, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Lesson } from '@/components/courses/CourseLessonList';

interface LessonHeaderProps {
  lesson: Lesson;
  courseId: string | undefined;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({ lesson, courseId }) => {
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
    <>
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
    </>
  );
};
