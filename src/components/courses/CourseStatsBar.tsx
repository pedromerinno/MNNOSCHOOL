
import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseStatsBarProps {
  duration: string;
  lessonCount: number;
  tags?: string[];
}

export const CourseStatsBar: React.FC<CourseStatsBarProps> = ({
  duration,
  lessonCount,
  tags = [],
}) => (
  <div className="flex items-center gap-6 text-sm">
    <div className="flex items-center gap-1">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span>{duration}</span>
    </div>
    <div className="flex items-center gap-1">
      <BookOpen className="h-4 w-4 text-muted-foreground" />
      <span>{lessonCount} lições</span>
    </div>
    {tags.length > 0 && (
      <div className="flex items-center gap-2">
        {tags.map((tag, i) => (
          <Badge key={i} variant="outline">{tag}</Badge>
        ))}
      </div>
    )}
  </div>
);
