
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLessons } from '@/hooks/useLessons';
import { LessonForm } from './LessonForm';
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

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/30">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">Nenhuma aula cadastrada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece adicionando a primeira aula para este curso.
                  </p>
                  <Button onClick={handleAddLesson}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Aula
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">Ordem</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead className="hidden md:table-cell">Tipo</TableHead>
                          <TableHead className="hidden md:table-cell">Duração</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lessons.map((lesson) => (
                          <TableRow key={lesson.id} className="h-16">
                            <TableCell className="font-medium">{lesson.order_index}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground hidden md:block">
                                  {lesson.description 
                                    ? lesson.description.length > 50 
                                      ? `${lesson.description.substring(0, 50)}...` 
                                      : lesson.description 
                                    : '-'
                                  }
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {lesson.type === 'video' && 'Vídeo'}
                              {lesson.type === 'text' && 'Texto'}
                              {lesson.type === 'quiz' && 'Quiz'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{lesson.duration || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditLesson(lesson)}
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Editar</span>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => confirmDeleteLesson(lesson)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Excluir</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
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
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>
              {selectedLesson ? 'Editar Aula' : 'Criar Nova Aula'}
            </SheetTitle>
            <SheetDescription>
              {selectedLesson 
                ? 'Atualize os detalhes da aula abaixo.' 
                : 'Preencha o formulário para criar uma nova aula.'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <LessonForm 
              initialData={selectedLesson}
              onSubmit={handleLessonFormSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aula "{selectedLesson?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteLesson}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
