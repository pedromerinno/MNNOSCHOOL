
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, FileText, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      {!hideBackButton && (
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o curso
          </Link>
        </Button>
      )}
      
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      
      <div className="flex items-center flex-wrap gap-2 mb-6">
        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 font-normal">
          {getLessonTypeIcon()}
          <span className="capitalize">{lesson.type}</span>
        </Badge>
        
        {lesson.duration && (
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 font-normal">
            <Clock className="h-4 w-4 mr-1" />
            <span>{lesson.duration}</span>
          </Badge>
        )}
        
        {lesson.completed && (
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 font-normal text-green-500 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Concluído</span>
          </Badge>
        )}
      </div>
    </>
  );
};
