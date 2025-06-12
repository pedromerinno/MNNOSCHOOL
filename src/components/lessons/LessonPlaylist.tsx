
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Play, CheckCircle, Clock, PlayCircle, BookOpen, Video, FileText, HelpCircle } from "lucide-react";
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
  companyColor?: string;
}

export const LessonPlaylist: React.FC<LessonPlaylistProps> = ({
  lessons,
  currentLessonId,
  onLessonSelect,
  loading = false,
  companyColor = "#1EAEDB"
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5" />;
      case 'text':
        return <FileText className="w-3.5 h-3.5" />;
      case 'quiz':
        return <HelpCircle className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Vídeo';
      case 'text':
        return 'Texto';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Aula';
    }
  };

  return (
    <div className="bg-background rounded-lg p-6">
      {/* Header with company color accent */}
      <div className="mb-6 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen 
            className="w-5 h-5" 
            style={{ color: companyColor }}
          />
          <h3 className="text-xl font-bold text-foreground">Aulas do Curso</h3>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: companyColor }}
            ></div>
            <span className="font-medium">{lessons.length} aulas</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{totalDuration}</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {lessons.map((lesson, index) => (
              <Card
                key={lesson.id}
                className={cn(
                  "transition-all duration-200 cursor-pointer group border hover:shadow-sm",
                  lesson.id === currentLessonId
                    ? "border-border/60 shadow-sm ring-1"
                    : "hover:bg-accent/50 border-border/60"
                )}
                style={{
                  backgroundColor: lesson.id === currentLessonId ? `${companyColor}08` : undefined,
                  borderColor: lesson.id === currentLessonId ? `${companyColor}30` : undefined,
                  '--tw-ring-color': lesson.id === currentLessonId ? `${companyColor}20` : undefined,
                } as React.CSSProperties}
                onClick={(e) => handleLessonClick(lesson.id, e)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Lesson indicator with company color */}
                    <div className="flex-shrink-0">
                      {lesson.completed ? (
                        <div className="w-10 h-10 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      ) : lesson.id === currentLessonId ? (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                          style={{
                            backgroundColor: `${companyColor}15`,
                            borderColor: `${companyColor}40`
                          }}
                        >
                          <PlayCircle 
                            className="h-5 w-5" 
                            style={{ color: companyColor }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted/60 border-2 border-muted-foreground/20 flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors"
                             style={{
                               '--tw-text-opacity': lesson.id === currentLessonId ? '1' : undefined,
                               color: lesson.id === currentLessonId ? companyColor : undefined
                             } as React.CSSProperties}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-semibold text-sm leading-snug mb-2 line-clamp-2 transition-colors",
                        lesson.id === currentLessonId 
                          ? "" 
                          : "text-foreground group-hover:text-primary"
                      )}
                      style={{
                        color: lesson.id === currentLessonId ? companyColor : undefined
                      }}>
                        {lesson.title}
                      </h4>
                      
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                          lesson.id === currentLessonId
                            ? ""
                            : "bg-muted/70 text-muted-foreground border-muted-foreground/20"
                        )}
                        style={{
                          backgroundColor: lesson.id === currentLessonId ? `${companyColor}15` : undefined,
                          color: lesson.id === currentLessonId ? companyColor : undefined,
                          borderColor: lesson.id === currentLessonId ? `${companyColor}20` : undefined
                        }}>
                          {getTypeIcon(lesson.type)}
                          <span>{getTypeLabel(lesson.type)}</span>
                        </div>
                        
                        {lesson.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{formatDuration(lesson.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Play button with company color */}
                    <div className="flex-shrink-0">
                      {lesson.id === currentLessonId ? (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center border"
                          style={{
                            backgroundColor: `${companyColor}15`,
                            borderColor: `${companyColor}30`
                          }}
                        >
                          <Play 
                            className="w-4 h-4 fill-current" 
                            style={{ color: companyColor }}
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-transparent group-hover:bg-primary/10 border border-transparent group-hover:border-primary/20 flex items-center justify-center transition-all">
                          <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
