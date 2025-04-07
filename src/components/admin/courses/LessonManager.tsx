
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLessons } from '@/hooks/useLessons';
import { LessonTable } from './LessonTable';
import { LessonFormSheet } from './LessonFormSheet';
import { DeleteLessonDialog } from './DeleteLessonDialog';
import { Lesson } from '@/components/courses/CourseLessonList';

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
    handleDeleteLesson
  } = useLessons(courseId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (courseId && open) {
      fetchLessons();
    }
  }, [courseId, open]);

  const handleAddLesson = () => {
    setSelectedLesson(undefined);
    setIsFormOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsFormOpen(true);
  };

  const handleLessonFormSubmit = async (data: any) => {
    if (selectedLesson) {
      await handleUpdateLesson(selectedLesson.id, data);
    } else {
      await handleCreateLesson(data);
    }
    setIsFormOpen(false);
  };

  const confirmDeleteLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteLesson = async () => {
    if (selectedLesson) {
      await handleDeleteLesson(selectedLesson.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-3xl p-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="text-lg font-semibold">
                Aulas do curso: {courseTitle}
              </SheetTitle>
              <SheetDescription>
                Adicione, edite ou remova aulas para este curso.
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
              />
            </div>
            
            <div className="border-t p-4 flex justify-end">
              <Button onClick={onClose}>
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
      />

      {/* Delete confirmation dialog */}
      <DeleteLessonDialog 
        isOpen={isDeleteDialogOpen}
        lessonTitle={selectedLesson?.title || ''}
        onClose={handleCloseDeleteDialog}
        onConfirm={executeDeleteLesson}
      />
    </>
  );
};
