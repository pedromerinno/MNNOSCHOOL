
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/durationUtils";

export interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  duration?: string | null;
  type: string;
  order_index?: number;
  course_id?: string;
  completed?: boolean;
  content?: string | null;
  course_description?: string | null;
  likes?: number;
  user_liked?: boolean;
  transcription_text?: string | null;
  transcription_status?: string | null;
  transcription_error?: string | null;
  transcribed_at?: string | null;
  transcription_metadata?: Record<string, any> | null;
  course_lessons?: Array<{
    id: string;
    title: string;
    type: string;
    duration?: string | null;
    completed?: boolean;
    order_index?: number;
  }>;
}

interface CourseLessonListProps {
  lessons: Lesson[];
  courseId: string;
  onSelectLesson?: (lessonId: string) => void;
  onStartLesson?: (lessonId: string) => Promise<void>;
}

export const CourseLessonList: React.FC<CourseLessonListProps> = ({
  lessons,
  courseId,
  onSelectLesson,
  onStartLesson
}) => {
  const navigate = useNavigate();
  
  const handleLessonClick = (lessonId: string) => {
    if (onSelectLesson) {
      onSelectLesson(lessonId);
    } else if (onStartLesson) {
      onStartLesson(lessonId);
    } else {
      navigate(`/courses/${courseId}/lessons/${lessonId}`);
    }
  };

  // Sort lessons by order_index to ensure they're always displayed in correct order
  const sortedLessons = [...lessons].sort((a, b) => 
    (a.order_index || 0) - (b.order_index || 0)
  );

  if (sortedLessons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Este curso ainda não tem aulas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-2">
      {sortedLessons.map((lesson, index) => (
        <div 
          key={lesson.id}
          className={cn(
            "p-3 rounded-lg border hover:bg-accent/30 transition-all cursor-pointer group",
            lesson.completed && "border-green-100/40 bg-green-50/30 dark:bg-green-900/5"
          )}
          onClick={() => handleLessonClick(lesson.id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {lesson.completed ? (
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {index + 1}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{lesson.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="capitalize">{lesson.type}</span>
                {lesson.duration && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
