
import React from 'react';
import { Card } from "@/components/ui/card";
import { Lesson } from '@/components/courses/CourseLessonList';
import { LessonVideo } from './LessonVideo';
import { LessonText } from './LessonText';
import { LessonQuiz } from './LessonQuiz';

interface LessonContentProps {
  lesson: Lesson;
  onVideoEnd?: () => void;
  autoplay?: boolean;
  showAutoplayPrompt?: boolean;
  onToggleAutoplay?: () => void;
  nextLessonTitle?: string;
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson,
  onVideoEnd,
  autoplay,
  showAutoplayPrompt,
  onToggleAutoplay,
  nextLessonTitle
}) => {
  const renderLessonContent = () => {
    if (!lesson) return null;
    
    switch (lesson.type.toLowerCase()) {
      case 'video':
        return (
          <LessonVideo 
            videoUrl={lesson.content || ''} 
            title={lesson.title}
            onVideoEnd={onVideoEnd}
            autoplay={autoplay}
            showAutoplayPrompt={showAutoplayPrompt}
            onToggleAutoplay={onToggleAutoplay}
            nextLessonTitle={nextLessonTitle}
          />
        );
      case 'text':
        return <LessonText content={lesson.content || null} />;
      case 'quiz':
        return <LessonQuiz title={lesson.title} content={lesson.content || null} />;
      default:
        return (
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground">Conteúdo não disponível</p>
          </div>
        );
    }
  };

  return (
    <Card className="mb-12 p-0 border border-border overflow-hidden">
      {renderLessonContent()}
    </Card>
  );
};
