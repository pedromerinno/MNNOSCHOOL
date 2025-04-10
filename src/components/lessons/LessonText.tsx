
import React from 'react';

interface LessonTextProps {
  content: string | null;
}

export const LessonText: React.FC<LessonTextProps> = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content || 'Conteúdo não disponível' }} />
    </div>
  );
};
