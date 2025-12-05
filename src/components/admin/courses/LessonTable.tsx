
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LessonTableProps {
  lessons: Lesson[];
  isLoading: boolean;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onAddLesson: () => void;
  onReorderLessons: (lessons: Lesson[]) => void;
  isAdmin?: boolean;
}

interface SortableLessonRowProps {
  lesson: Lesson;
  index: number;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  isAdmin?: boolean;
}

const SortableLessonRow: React.FC<SortableLessonRowProps> = ({
  lesson,
  index,
  onEditLesson,
  onDeleteLesson,
  isAdmin = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`h-16 ${isDragging ? 'bg-accent/50 shadow-lg border-primary' : ''} transition-all duration-200`}
    >
      {isAdmin ? (
        <TableCell>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </TableCell>
      ) : (
        <TableCell></TableCell>
      )}
      <TableCell className="font-medium">{lesson.order_index || index + 1}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{lesson.title}</div>
          <div className="text-xs text-muted-foreground hidden md:block">
            {lesson.description
              ? lesson.description.length > 50
                ? `${lesson.description.substring(0, 50)}...`
                : lesson.description
              : '-'}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {lesson.type === 'video' && 'Vídeo'}
        {lesson.type === 'text' && 'Texto'}
        {lesson.type === 'quiz' && 'Quiz'}
      </TableCell>
      <TableCell className="hidden md:table-cell">{lesson.duration || '-'}</TableCell>
      {isAdmin && (
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
      )}
      {!isAdmin && <TableCell className="text-right"></TableCell>}
    </TableRow>
  );
};

export const LessonTable: React.FC<LessonTableProps> = ({
  lessons,
  isLoading,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  onReorderLessons,
  isAdmin = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isAdmin) return;
    
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);

      const reorderedLessons = arrayMove(lessons, oldIndex, newIndex);

      // Update order_index for each lesson - ensure it's sequential starting from 1
      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        order_index: index + 1
      }));

      // Optimistically update the UI first
      onReorderLessons(updatedLessons);
    }
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
        {isAdmin && (
          <Button onClick={onAddLesson}>
            Adicionar Aula
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead className="w-[40px]"></TableHead>}
                <TableHead className="w-[60px]">Ordem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Duração</TableHead>
                {isAdmin && <TableHead className="text-right w-[60px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <SortableContext
              items={lessons.map((lesson) => lesson.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {lessons.map((lesson, index) => (
                  <SortableLessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    onEditLesson={onEditLesson}
                    onDeleteLesson={onDeleteLesson}
                    isAdmin={isAdmin}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>
    </div>
  );
};
