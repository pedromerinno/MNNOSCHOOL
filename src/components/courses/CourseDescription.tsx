
import React from 'react';

interface CourseDescriptionProps {
  description: string | null;
}

export const CourseDescription: React.FC<CourseDescriptionProps> = ({ 
  description 
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Sobre o Curso</h2>
      <p className="text-muted-foreground">
        {description || 'Nenhuma descrição disponível.'}
      </p>
    </div>
  );
};
