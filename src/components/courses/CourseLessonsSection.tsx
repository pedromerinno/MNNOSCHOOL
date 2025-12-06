
import React, { useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { CourseLessonList } from './CourseLessonList';
import { supabase } from "@/integrations/supabase/client";

interface CourseLessonsSectionProps {
  isAdmin: boolean;
  showLessonManager: boolean;
  setShowLessonManager: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  lessons: any[];
  startLesson: (lessonId: string) => Promise<void>;
  refreshCourseData: () => void;
}

export const CourseLessonsSection: React.FC<CourseLessonsSectionProps> = React.memo(({
  isAdmin,
  showLessonManager,
  setShowLessonManager,
  courseId,
  courseTitle,
  lessons,
  startLesson,
  refreshCourseData
}) => {
  // Setup real-time subscription for lessons - with proper cleanup
  useEffect(() => {
    if (!courseId) return;

    // Use a unique channel name to prevent duplicate subscriptions
    const channelName = `course-lessons-${courseId}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Setting up real-time subscription for course lessons: ${courseId} (${channelName})`);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `course_id=eq.${courseId}`
      }, (payload) => {
        console.log('Lesson update detected:', payload);
        refreshCourseData();
      })
      .subscribe((status) => {
        console.log(`Course lessons subscription status (${channelName}): ${status}`);
      });
    
    return () => {
      console.log(`Cleaning up course lessons subscription (${channelName})`);
      supabase.removeChannel(channel);
    };
  }, [courseId, refreshCourseData]);

  const handleOpenManager = useCallback(() => {
    setShowLessonManager(true);
  }, [setShowLessonManager]);

  const handleCloseManager = useCallback(() => {
    setShowLessonManager(false);
  }, [setShowLessonManager]);

  // Calcular estatísticas das aulas
  const lessonStats = useMemo(() => {
    const total = lessons.length;
    const completed = lessons.filter(l => l.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [lessons]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Aulas do Curso
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lessonStats.total} {lessonStats.total === 1 ? 'aula' : 'aulas'}
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <Button 
            className="gap-1.5 rounded-xl font-medium text-sm h-9"
            onClick={handleOpenManager}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Gerenciar
          </Button>
        )}
      </div>

      {/* Stats Card - Aulas Completas */}
      {lessonStats.completed > 0 && (
        <div className="overflow-hidden rounded-3xl border-0" style={{ backgroundColor: "#FFF6C9" }}>
          <div className="p-6 min-h-[100px] flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Aulas completas
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {String(lessonStats.completed).padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                de {lessonStats.total}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Card - Pendentes */}
      {lessonStats.pending > 0 && (
        <div className="overflow-hidden rounded-3xl border-0" style={{ backgroundColor: "#E4ECFF" }}>
          <div className="p-6 min-h-[100px] flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Aulas pendentes
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {String(lessonStats.pending).padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                para completar
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Aulas */}
      <div>
        <LessonManager
          courseId={courseId}
          courseTitle={courseTitle}
          open={showLessonManager}
          onClose={handleCloseManager}
        />
        
        <div className="max-h-[calc(100vh-500px)] overflow-y-auto pr-2 -mr-2">
          <CourseLessonList 
            lessons={lessons} 
            courseId={courseId}
            onStartLesson={startLesson}
          />
        </div>
      </div>
    </div>
  );
});
