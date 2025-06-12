
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Play, CheckCircle, Clock, PlayCircle } from "lucide-react";
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
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-3 text-foreground">Aulas do Curso</h3>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-sm font-medium">{lessons.length} aulas</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{totalDuration}</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <Card
                key={lesson.id}
                className={cn(
                  "transition-all duration-300 cursor-pointer hover:shadow-md group border-0 shadow-sm",
                  lesson.id === currentLessonId
                    ? "bg-primary/5 border-l-4 border-l-primary shadow-md"
                    : "hover:bg-accent/50 border-l-4 border-l-transparent hover:border-l-primary/30"
                )}
                onClick={(e) => handleLessonClick(lesson.id, e)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {lesson.completed ? (
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                      ) : lesson.id === currentLessonId ? (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <PlayCircle className="h-6 w-6 text-primary" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted/80 border-2 border-muted-foreground/20 flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-semibold text-base leading-tight mb-2",
                        lesson.id === currentLessonId 
                          ? "text-primary" 
                          : "text-foreground group-hover:text-primary transition-colors"
                      )}>
                        {lesson.title}
                      </h4>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1 bg-muted/50 rounded-md">
                          {lesson.type === 'video' ? 'Vídeo' : lesson.type === 'text' ? 'Texto' : 'Quiz'}
                        </span>
                        {lesson.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(lesson.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {lesson.id === currentLessonId ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Play className="w-4 h-4 text-primary fill-primary" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-transparent group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
