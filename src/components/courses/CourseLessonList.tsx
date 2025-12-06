
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
  course_title?: string | null;
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

export const CourseLessonList: React.FC<CourseLessonListProps> = React.memo(({
  lessons,
  courseId,
  onSelectLesson,
  onStartLesson
}) => {
  const navigate = useNavigate();
  
  const handleLessonClick = React.useCallback((lessonId: string) => {
    if (onSelectLesson) {
      onSelectLesson(lessonId);
    } else if (onStartLesson) {
      onStartLesson(lessonId);
    } else {
      navigate(`/courses/${courseId}/lessons/${lessonId}`);
    }
  }, [onSelectLesson, onStartLesson, navigate, courseId]);

  // Sort lessons by order_index to ensure they're always displayed in correct order
  const sortedLessons = React.useMemo(() => {
    return [...lessons].sort((a, b) => 
      (a.order_index || 0) - (b.order_index || 0)
    );
  }, [lessons]);

  if (sortedLessons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Este curso ainda não tem aulas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sortedLessons.map((lesson, index) => (
        <button
          key={lesson.id}
          className={cn(
            "w-full text-left p-4 rounded-2xl border-0 transition-all duration-200 cursor-pointer group",
            "hover:shadow-md hover:scale-[1.02]",
            lesson.completed 
              ? "bg-green-50/80 dark:bg-green-900/10 hover:bg-green-100/90 dark:hover:bg-green-900/20" 
              : "bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-100/90 dark:hover:bg-gray-800/70"
          )}
          onClick={() => handleLessonClick(lesson.id)}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {lesson.completed ? (
                <div className="w-12 h-12 rounded-xl bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-semibold text-base shadow-sm">
                  {index + 1}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-semibold text-base mb-1.5 truncate",
                lesson.completed 
                  ? "text-gray-900 dark:text-white" 
                  : "text-gray-900 dark:text-white"
              )}>
                {lesson.title}
              </h4>
              <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="capitalize font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-gray-700/60">
                  {lesson.type}
                </span>
                {lesson.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{formatDuration(lesson.duration)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});
