
import React from 'react';
import { LikeButton } from './LikeButton';
import { CompleteButton } from './CompleteButton';
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Play } from 'lucide-react';
import { formatDuration } from '@/utils/durationUtils';

interface LessonActionsProps {
  completed: boolean;
  onMarkCompleted: () => void;
  likes: number;
  userLiked: boolean;
  onToggleLike: () => void;
  lessonType?: string;
  lessonDuration?: string;
}

export const LessonActions: React.FC<LessonActionsProps> = ({
  completed,
  onMarkCompleted,
  likes,
  userLiked,
  onToggleLike,
  lessonType,
  lessonDuration
}) => {
  const getLessonTypeIcon = () => {
    switch (lessonType?.toLowerCase()) {
      case 'video':
        return <Play className="h-4 w-4 mr-1" />;
      case 'text':
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {lessonType && (
        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 font-normal">
          {getLessonTypeIcon()}
          <span className="capitalize">{lessonType}</span>
        </Badge>
      )}
      
      {lessonDuration && (
        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 font-normal">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatDuration(lessonDuration)}</span>
        </Badge>
      )}
      
      <div className="flex-1"></div>
      
      <LikeButton 
        likes={likes} 
        userLiked={userLiked} 
        onToggleLike={onToggleLike} 
      />
      
      <CompleteButton 
        completed={completed} 
        onMarkCompleted={onMarkCompleted} 
      />
    </div>
  );
};
