
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Play, CheckCircle, Clock, PlayCircle, BookOpen, Video, FileText, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateTotalDuration, formatDuration } from "@/utils/durationUtils";
import { useNavigate, useParams } from 'react-router-dom';

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
  courseId?: string;
}

export const LessonPlaylist: React.FC<LessonPlaylistProps> = ({
  lessons,
  currentLessonId,
  onLessonSelect,
  loading = false,
  companyColor = "#1EAEDB",
  courseId
}) => {
  const [navigatingToLesson, setNavigatingToLesson] = useState<string | null>(null);
  const [localLessons, setLocalLessons] = useState(lessons);
  const navigate = useNavigate();
  const { courseId: paramCourseId } = useParams();
  const effectiveCourseId = courseId || paramCourseId;
  const totalDuration = calculateTotalDuration(localLessons);

  console.log('🎯 LessonPlaylist: courseId atual:', effectiveCourseId, 'currentLessonId:', currentLessonId);

  // Atualizar lessons locais quando props mudam
  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  // Escutar atualizações de título das aulas
  useEffect(() => {
    const handleLessonFieldUpdate = (event: CustomEvent) => {
      const { lessonId, field, value } = event.detail;
      
      if (field === 'title') {
        console.log('📝 Atualizando título na playlist:', lessonId, value);
        setLocalLessons(prevLessons => 
          prevLessons.map(lesson => 
            lesson.id === lessonId 
              ? { ...lesson, title: value }
              : lesson
          )
        );
      }
    };

    window.addEventListener('lesson-field-updated', handleLessonFieldUpdate as EventListener);
    
    return () => {
      window.removeEventListener('lesson-field-updated', handleLessonFieldUpdate as EventListener);
    };
  }, []);

  // Clear navigating state when current lesson changes
  useEffect(() => {
    if (navigatingToLesson && navigatingToLesson === currentLessonId) {
      console.log('✅ LessonPlaylist: Navegação completa para:', currentLessonId);
      setNavigatingToLesson(null);
    }
  }, [currentLessonId, navigatingToLesson]);

  const handleLessonClick = (lessonId: string) => {
    if (lessonId === currentLessonId) {
      console.log('🚫 LessonPlaylist: Clique ignorado - mesma aula');
      return;
    }
    
    console.log('🔗 LessonPlaylist: Navegação imediata para:', lessonId);
    
    if (!effectiveCourseId) {
      console.error('❌ LessonPlaylist: courseId não encontrado');
      return;
    }
    
    setNavigatingToLesson(lessonId);
    
    // Navegação imediata sem delays
    const newPath = `/courses/${effectiveCourseId}/lessons/${lessonId}`;
    navigate(newPath, { replace: false });
    
    // Clear navigating state after a longer delay to show loading
    setTimeout(() => setNavigatingToLesson(null), 1500);
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

  // Loading component
  const PlaylistLoading = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="bg-background rounded-lg p-6 h-fit">
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
            <span className="font-medium">{localLessons.length} aulas</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{totalDuration}</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <PlaylistLoading />
        ) : (
          <>
            {localLessons.map((lesson, index) => {
              const isCurrentLesson = lesson.id === currentLessonId;
              const isNavigating = navigatingToLesson === lesson.id;
              
              return (
                <Card
                  key={lesson.id}
                  className={cn(
                    "transition-all duration-150 cursor-pointer group border hover:shadow-sm",
                    isCurrentLesson
                      ? "border-border/60 shadow-sm ring-1"
                      : "hover:bg-accent/50 border-border/60",
                    isNavigating && "opacity-70"
                  )}
                  style={{
                    backgroundColor: isCurrentLesson ? `${companyColor}08` : undefined,
                    borderColor: isCurrentLesson ? `${companyColor}30` : undefined,
                    '--tw-ring-color': isCurrentLesson ? `${companyColor}20` : undefined,
                  } as React.CSSProperties}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Lesson indicator */}
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <div className="w-10 h-10 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        ) : isCurrentLesson ? (
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
                          <div className="w-10 h-10 rounded-full bg-muted/60 border-2 border-muted-foreground/20 flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-semibold text-sm leading-snug mb-2 line-clamp-2 transition-colors",
                          isCurrentLesson 
                            ? "" 
                            : "text-foreground group-hover:text-primary"
                        )}
                        style={{
                          color: isCurrentLesson ? companyColor : undefined
                        }}>
                          {lesson.title}
                        </h4>
                        
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                            isCurrentLesson
                              ? ""
                              : "bg-muted/70 text-muted-foreground border-muted-foreground/20"
                          )}
                          style={{
                            backgroundColor: isCurrentLesson ? `${companyColor}15` : undefined,
                            color: isCurrentLesson ? companyColor : undefined,
                            borderColor: isCurrentLesson ? `${companyColor}20` : undefined
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

                      {/* Play button or loading */}
                      <div className="flex-shrink-0">
                        {isNavigating ? (
                          <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : isCurrentLesson ? (
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
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
