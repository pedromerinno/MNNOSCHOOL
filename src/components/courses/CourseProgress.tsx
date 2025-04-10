
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { useCompanies } from "@/hooks/useCompanies";

interface CourseProgressProps {
  progress: number;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ progress }) => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Progresso do curso</h3>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
        indicatorClassName="bg-transparent"
        style={{
          "--progress-background": companyColor
        } as React.CSSProperties} 
      />
    </div>
  );
};
