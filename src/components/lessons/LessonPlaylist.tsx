
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleLessonClick = (lessonId: string) => {
    if (lessonId !== currentLessonId) {
      onLessonSelect(lessonId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          Aulas do Curso
          <span className="text-sm text-muted-foreground">
            Aula {currentIndex + 1} de {lessons.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors border-l-4",
                  lesson.id === currentLessonId
                    ? "border-l-primary bg-accent"
                    : "border-l-transparent"
                )}
                onClick={() => handleLessonClick(lesson.id)}
              >
                <div className="flex-shrink-0 w-8 h-8">
                  {lesson.completed ? (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      ✓
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{lesson.type}</span>
                    {lesson.duration && (
                      <>
                        <span>•</span>
                        <span>{lesson.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                {lesson.id === currentLessonId && (
                  <Play className="w-4 h-4 text-primary" />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
