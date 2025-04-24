
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { CourseLessonList } from './CourseLessonList';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseLessonsSectionProps {
  isAdmin: boolean;
  showLessonManager: boolean;
  setShowLessonManager: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  lessons: any[];
  startLesson: (lessonId: string) => Promise<void>;
}

export const CourseLessonsSection: React.FC<CourseLessonsSectionProps> = ({
  isAdmin,
  showLessonManager,
  setShowLessonManager,
  courseId,
  courseTitle,
  lessons,
  startLesson,
}) => {
  // Setup real-time subscription for lessons
  useEffect(() => {
    if (!courseId) return;

    console.log(`Setting up real-time subscription for course lessons: ${courseId}`);
    
    const channel = supabase
      .channel(`course-lessons-${courseId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `course_id=eq.${courseId}`
      }, (payload) => {
        console.log('Lesson update detected:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            toast.success('Nova aula adicionada', {
              description: 'A lista de aulas foi atualizada automaticamente.'
            });
            break;
          case 'UPDATE':
            toast.success('Aula atualizada', {
              description: 'As alterações foram aplicadas com sucesso.'
            });
            break;
          case 'DELETE':
            toast.success('Aula removida', {
              description: 'A aula foi removida com sucesso.'
            });
            break;
        }
      })
      .subscribe((status) => {
        console.log(`Course lessons subscription status: ${status}`);
      });
    
    return () => {
      console.log("Cleaning up course lessons subscription");
      supabase.removeChannel(channel);
    };
  }, [courseId]);

  return (
    <div className="w-full md:w-4/12 mt-8 md:mt-0 relative">
      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Aulas do Curso</h3>
          {isAdmin && (
            <Button 
              className="bg-primary text-white gap-2 rounded-xl font-normal text-sm py-2 shadow-none"
              onClick={() => setShowLessonManager(true)}
              variant="default"
              size="sm"
              aria-label="Gerenciar aulas"
            >
              <Plus className="h-4 w-4" />
              Gerenciar aulas
            </Button>
          )}
        </div>

        <LessonManager
          courseId={courseId}
          courseTitle={courseTitle}
          open={showLessonManager}
          onClose={() => setShowLessonManager(false)}
        />

        <CourseLessonList 
          lessons={lessons} 
          courseId={courseId}
          onStartLesson={startLesson}
        />
      </div>
    </div>
  );
};

