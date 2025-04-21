
import React from "react";

interface CourseProgressBoxProps {
  progress: number;
}

export const CourseProgressBox: React.FC<CourseProgressBoxProps> = ({ progress }) => {
  if (progress <= 0) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Seu progresso</h3>
        <span className="text-sm">{progress}% concluído</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
