
import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Lesson } from '@/components/courses/CourseLessonList';

interface LessonTableProps {
  lessons: Lesson[];
  isLoading: boolean;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onAddLesson: () => void;
}

export const LessonTable: React.FC<LessonTableProps> = ({
  lessons,
  isLoading,
  onEditLesson,
  onDeleteLesson,
  onAddLesson
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/30">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Nenhuma aula cadastrada</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece adicionando a primeira aula para este curso.
        </p>
        <Button onClick={onAddLesson}>
          Adicionar Aula
        </Button>
      </div>
    );
  }

  return (
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
                      onClick={() => onEditLesson(lesson)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDeleteLesson(lesson)}
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
  );
};
