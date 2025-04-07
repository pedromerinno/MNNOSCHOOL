
import React from 'react';

interface CourseDescriptionProps {
  description: string | null;
}

export const CourseDescription: React.FC<CourseDescriptionProps> = ({ 
  description 
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Sobre o Curso</h2>
      <p className="text-gray-600 dark:text-gray-400">
        {description || 'Nenhuma descrição disponível.'}
      </p>
    </div>
  );
};
