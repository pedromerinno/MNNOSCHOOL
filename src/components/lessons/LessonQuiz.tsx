
import React from 'react';

interface LessonQuizProps {
  title: string;
  content: string | null;
}

export const LessonQuiz: React.FC<LessonQuizProps> = ({ title, content }) => {
  return (
    <div className="p-6 bg-muted rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Quiz: {title}</h3>
      <p className="mb-4 text-muted-foreground">{content || 'Este quiz será implementado em breve'}</p>
    </div>
  );
};
