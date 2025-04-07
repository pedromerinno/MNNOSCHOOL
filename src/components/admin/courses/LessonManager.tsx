
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
}

export const LessonManager: React.FC<LessonManagerProps> = ({ 
  courseId, 
  courseTitle,
  onClose 
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
    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Aulas do curso: {courseTitle}
        </h3>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ordem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>{lesson.order_index}</TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>
                    {lesson.description 
                      ? lesson.description.length > 50 
                        ? `${lesson.description.substring(0, 50)}...` 
                        : lesson.description 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {lesson.type === 'video' && 'Vídeo'}
                    {lesson.type === 'text' && 'Texto'}
                    {lesson.type === 'quiz' && 'Quiz'}
                  </TableCell>
                  <TableCell>{lesson.duration || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditLesson(lesson)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDeleteLesson(lesson)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button onClick={onClose}>
          Fechar
        </Button>
      </div>

      {/* Form dialog for adding/editing lessons */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? 'Editar Aula' : 'Criar Nova Aula'}
            </DialogTitle>
            <DialogDescription>
              {selectedLesson 
                ? 'Atualize os detalhes da aula abaixo.' 
                : 'Preencha o formulário para criar uma nova aula.'}
            </DialogDescription>
          </DialogHeader>
          <LessonForm 
            initialData={selectedLesson}
            onSubmit={handleLessonFormSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
    </div>
  );
};
