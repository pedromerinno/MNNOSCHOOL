
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateTotalDuration, formatDuration } from "@/utils/durationUtils";

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
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Aulas do Curso</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{lessons.length} aulas</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground px-2 py-1 bg-muted/50 rounded-md">{totalDuration}</span>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/60 transition-all duration-200 rounded-lg border-l-3 shadow-sm",
                  lesson.id === currentLessonId
                    ? "border-l-primary bg-accent/80 shadow-md"
                    : "border-l-transparent hover:border-l-primary/30"
                )}
                onClick={(e) => handleLessonClick(lesson.id, e)}
              >
                <div className="flex-shrink-0 w-7 h-7">
                  {lesson.completed ? (
                    <div className="w-7 h-7 text-green-500 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2",
                      lesson.id === currentLessonId 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-muted/80 text-muted-foreground border-muted-foreground/20 hover:border-primary/40"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm truncate leading-tight",
                    lesson.id === currentLessonId && "text-primary font-semibold"
                  )}>
                    {lesson.title}
                  </h4>
                  {lesson.duration && (
                    <div className="text-xs text-muted-foreground mt-1 px-2 py-0.5 bg-muted/40 rounded-md inline-block">
                      {formatDuration(lesson.duration)}
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
