
import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, GripVertical, MoreHorizontal } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { Lesson } from '@/components/courses/CourseLessonList';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface LessonTableProps {
  lessons: Lesson[];
  isLoading: boolean;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onAddLesson: () => void;
  onReorderLessons: (lessons: Lesson[]) => void;
}

export const LessonTable: React.FC<LessonTableProps> = ({
  lessons,
  isLoading,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  onReorderLessons
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order_index for each lesson - ensure it's sequential starting from 1
    const reorderedLessons = items.map((lesson, index) => ({
      ...lesson,
      order_index: index + 1
    }));

    // Optimistically update the UI first
    onReorderLessons(reorderedLessons);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[60px]">Ordem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Duração</TableHead>
                <TableHead className="text-right w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId="lessons">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {lessons.map((lesson, index) => (
                    <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                      {(provided, snapshot) => (
                        <TableRow 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`h-16 ${snapshot.isDragging ? 'bg-accent/50 shadow-lg border-primary' : ''} transition-all duration-200`}
                        >
                          <TableCell>
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded transition-colors"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{lesson.order_index || index + 1}</TableCell>
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => onEditLesson(lesson)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onDeleteLesson(lesson)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </div>
    </div>
  );
};
