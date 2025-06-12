
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLessons } from '@/hooks/useLessons';
import { LessonTable } from './LessonTable';
import { LessonFormSheet } from './LessonFormSheet';
import { DeleteLessonDialog } from './DeleteLessonDialog';
import { Lesson } from '@/components/courses/CourseLessonList';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LessonManagerProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  open: boolean;
}

export const LessonManager: React.FC<LessonManagerProps> = ({ 
  courseId, 
  courseTitle,
  onClose,
  open
}) => {
  const { 
    lessons, 
    isLoading, 
    selectedLesson, 
    setSelectedLesson,
    isSubmitting,
    fetchLessons,
    handleCreateLesson,
    handleUpdateLesson, 
    handleReorderLessons,
    handleDeleteLesson
  } = useLessons(courseId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set up Supabase real-time subscription for lessons
  useEffect(() => {
    if (!courseId || !open) return;

    console.log(`Setting up real-time subscription for lesson manager: ${courseId}`);
    
    const channel = supabase
      .channel(`lesson-manager-${courseId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `course_id=eq.${courseId}`
      }, (payload) => {
        console.log('Lesson change detected in manager:', payload);
        // Refresh the lesson list when there's any change
        fetchLessons();
        
        // Show feedback to the user
        if (payload.eventType === 'INSERT') {
          toast.success("Aula adicionada com sucesso");
        } else if (payload.eventType === 'UPDATE') {
          toast.success("Aula atualizada com sucesso");
        } else if (payload.eventType === 'DELETE') {
          toast.success("Aula removida com sucesso");
        }
      })
      .subscribe((status) => {
        console.log(`Lesson manager subscription status: ${status}`);
      });
    
    // Initial fetch when opening the manager
    fetchLessons();
    
    return () => {
      console.log("Cleaning up lesson manager real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [courseId, open, fetchLessons]);

  const handleClose = () => {
    onClose();
    
    // Trigger course refresh when lesson manager closes
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('course-updated', {
        detail: { courseId }
      }));
    }, 100);
  };

  const handleAddLesson = () => {
    setSelectedLesson(undefined);
    setIsFormOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsFormOpen(true);
  };

  const handleLessonFormSubmit = async (data: any) => {
    try {
      if (selectedLesson) {
        await handleUpdateLesson(selectedLesson.id, data);
      } else {
        await handleCreateLesson(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error submitting lesson form:", error);
    }
  };

  const confirmDeleteLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteLesson = async () => {
    if (selectedLesson) {
      setIsDeleting(true);
      try {
        await handleDeleteLesson(selectedLesson.id);
      } catch (error) {
        console.error("Error deleting lesson:", error);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <SheetContent side="right" className="w-full sm:max-w-4xl p-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="text-lg font-semibold">
                Aulas do curso: {courseTitle}
              </SheetTitle>
              <SheetDescription>
                Adicione, edite, reordene ou remova aulas para este curso. Arraste e solte para reordenar.
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Lista de Aulas</h3>
                <Button onClick={handleAddLesson}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aula
                </Button>
              </div>

              <LessonTable 
                lessons={lessons}
                isLoading={isLoading}
                onEditLesson={handleEditLesson}
                onDeleteLesson={confirmDeleteLesson}
                onAddLesson={handleAddLesson}
                onReorderLessons={handleReorderLessons}
              />
            </div>
            
            <div className="border-t p-4 flex justify-end">
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Form dialog for adding/editing lessons */}
      <LessonFormSheet 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        selectedLesson={selectedLesson}
        onSubmit={handleLessonFormSubmit}
        isSubmitting={isSubmitting}
        courseId={courseId}
      />

      {/* Delete confirmation dialog */}
      <DeleteLessonDialog 
        isOpen={isDeleteDialogOpen}
        lessonTitle={selectedLesson?.title || ''}
        onClose={handleCloseDeleteDialog}
        onConfirm={executeDeleteLesson}
        isDeleting={isDeleting}
      />
    </>
  );
};
