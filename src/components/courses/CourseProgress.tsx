
import React from 'react';
import { Progress } from "@/components/ui/progress";

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
    <div>
      <h2 className="text-xl font-semibold mb-3">Seu Progresso</h2>
      <Progress value={progress} className="h-2 mb-2" />
      <p className="text-sm text-muted-foreground">
        {progress}% completo
      </p>
    </div>
  );
};
