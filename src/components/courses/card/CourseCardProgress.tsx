
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CompanyThemedBadge } from "@/components/ui/badge";

interface CourseCardProgressProps {
  completed: boolean;
  progress: number;
}

export const CourseCardProgress: React.FC<CourseCardProgressProps> = ({ completed, progress }) => {
  return (
    <div
      onClick={(e) => e.preventDefault()} 
      className="flex items-center space-x-2"
    >
      {completed ? (
        <CompanyThemedBadge variant="outline" className="px-3 py-1">
          Concluído
        </CompanyThemedBadge>
      ) : progress > 0 ? (
        <CompanyThemedBadge variant="outline" className="px-3 py-1">
          {progress}% concluído
        </CompanyThemedBadge>
      ) : null}
      
      <div className="rounded-full h-8 w-8 p-0 flex items-center justify-center">
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};
