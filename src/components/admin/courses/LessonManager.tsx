import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLessons } from '@/hooks/useLessons';
import { LessonTable } from './LessonTable';
import { LessonFormSheet } from './LessonFormSheet';
import { DeleteLessonDialog } from './DeleteLessonDialog';
import { Lesson } from '@/components/courses/CourseLessonList';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsAdmin } from '@/hooks/company/useIsAdmin';
import { HorizontalSheet, SettingsSection } from "@/components/ui/horizontal-sheet";
import { useCompanies } from '@/hooks/useCompanies';

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
  const { isAdmin } = useIsAdmin();
  const { selectedCompany } = useCompanies();
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

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const sections: SettingsSection[] = useMemo(() => {
    return [
      {
        id: 'lessons',
        label: 'Lista de Aulas',
        content: (
          <LessonTable 
            lessons={lessons}
            isLoading={isLoading}
            onEditLesson={handleEditLesson}
            onDeleteLesson={confirmDeleteLesson}
            onAddLesson={handleAddLesson}
            onReorderLessons={handleReorderLessons}
            isAdmin={isAdmin}
          />
        )
      }
    ];
  }, [lessons, isLoading, isAdmin]);

  return (
    <>
      <HorizontalSheet
        open={open}
        onOpenChange={(isOpen) => !isOpen && handleClose()}
        title={courseTitle}
        sections={sections}
        defaultSectionId="lessons"
        onCancel={handleClose}
        cancelLabel="Fechar"
        side="right"
        maxWidth="sm:max-w-3xl"
        contentPadding="p-6"
        alwaysShowSidebar={false}
        getCancelButton={(activeSection) => {
          if (activeSection === 'lessons' && isAdmin) {
            return (
              <Button 
                onClick={handleAddLesson} 
                variant="outline"
                className="gap-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-normal"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Nova Aula
              </Button>
            );
          }
          return null;
        }}
      />

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
