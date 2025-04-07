
import React from 'react';

interface CourseProgressProps {
  progress: number;
  showProgressBar?: boolean;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ 
  progress,
  showProgressBar = true
}) => {
  if (progress <= 0 && !showProgressBar) {
    return null;
  }
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Seu Progresso</h2>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {progress}% completo
      </p>
    </div>
  );
};
