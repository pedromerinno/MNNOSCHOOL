
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateTotalDuration } from "@/utils/durationUtils";

interface LessonPlaylistProps {
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    completed?: boolean;
    duration?: string | null;
  }>;
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  loading?: boolean;
}

export const LessonPlaylist: React.FC<LessonPlaylistProps> = ({
  lessons,
  currentLessonId,
  onLessonSelect,
  loading = false
}) => {
  const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
  const totalDuration = calculateTotalDuration(lessons);

  // Prevent default click behavior and handle lesson selection
  const handleLessonClick = (lessonId: string, e: React.MouseEvent) => {
    // Only proceed if this isn't already the active lesson
    if (lessonId !== currentLessonId) {
      e.preventDefault();
      e.stopPropagation();
      onLessonSelect(lessonId);
    }
  };

  return (
    <div className="bg-background rounded-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium">Aulas do Curso</h3>
        <span className="text-xs text-muted-foreground">
          {totalDuration}
        </span>
      </div>
      
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-1">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={cn(
                  "flex items-center gap-3 p-2.5 cursor-pointer hover:bg-accent/50 transition-colors rounded-md border-l-2",
                  lesson.id === currentLessonId
                    ? "border-l-primary bg-accent/80"
                    : "border-l-transparent"
                )}
                onClick={(e) => handleLessonClick(lesson.id, e)}
              >
                <div className="flex-shrink-0 w-6 h-6">
                  {lesson.completed ? (
                    <div className="w-6 h-6 text-green-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      lesson.id === currentLessonId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm truncate",
                    lesson.id === currentLessonId && "text-primary"
                  )}>
                    {lesson.title}
                  </h4>
                  {lesson.duration && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {lesson.duration}
                    </div>
                  )}
                </div>

                {lesson.id === currentLessonId && (
                  <Play className="w-4 h-4 text-primary shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
