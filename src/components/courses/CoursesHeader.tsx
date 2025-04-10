
import React from 'react';

interface CoursesHeaderProps {
  title: string;
  subtitle?: string;
}

export const CoursesHeader: React.FC<CoursesHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
