
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";

interface CourseStatsBarProps {
  duration: string;
  lessonCount: number;
  tags?: string[] | null;
}

export const CourseStatsBar: React.FC<CourseStatsBarProps> = ({
  duration,
  lessonCount,
  tags
}) => {
  return (
    <div className="flex flex-wrap items-center gap-6 py-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{duration}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{lessonCount} aulas</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800">
              {tag}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Curso
          </Badge>
        )}
      </div>
    </div>
  );
};
