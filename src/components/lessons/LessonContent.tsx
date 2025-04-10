
import React from 'react';
import { Card } from "@/components/ui/card";
import { Lesson } from '@/components/courses/CourseLessonList';
import { LessonVideo } from './LessonVideo';
import { LessonText } from './LessonText';
import { LessonQuiz } from './LessonQuiz';

interface LessonContentProps {
  lesson: Lesson;
}

export const LessonContent: React.FC<LessonContentProps> = ({ lesson }) => {
  const renderLessonContent = () => {
    if (!lesson) return null;
    
    switch (lesson.type.toLowerCase()) {
      case 'video':
        return <LessonVideo videoUrl={lesson.content} title={lesson.title} />;
      case 'text':
        return <LessonText content={lesson.content} />;
      case 'quiz':
        return <LessonQuiz title={lesson.title} content={lesson.content} />;
      default:
        return (
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground">Conteúdo não disponível</p>
          </div>
        );
    }
  };

  return (
    <Card className="mb-8 p-6 border border-border">
      {renderLessonContent()}
    </Card>
  );
};
