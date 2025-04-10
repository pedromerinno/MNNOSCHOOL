
import React from 'react';

interface CourseDescriptionProps {
  description: string | null;
}

export const CourseDescription: React.FC<CourseDescriptionProps> = ({ 
  description 
}) => {
  if (!description) {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Nenhuma descrição disponível para este curso.</p>
      </div>
    );
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <h2 className="text-2xl font-semibold mb-4">Sobre o Curso</h2>
      <div 
        className="text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};
