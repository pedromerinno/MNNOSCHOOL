
import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, GripVertical, MoreHorizontal, Plus } from "lucide-react";
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
      className={`h-14 border-b border-gray-100 ${isDragging ? 'bg-blue-50/50 shadow-sm z-10' : 'hover:bg-gray-50/50'} transition-all duration-200`}
    >
      {isAdmin ? (
        <TableCell className="px-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-100 rounded transition-colors inline-flex"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </TableCell>
      ) : (
        <TableCell className="px-4"></TableCell>
      )}
      <TableCell className="px-4">
        <span className="font-medium text-sm text-gray-500">{lesson.order_index || index + 1}</span>
      </TableCell>
      <TableCell className="px-4">
        <div className="min-w-0">
          <div className="font-medium text-sm text-gray-900">{lesson.title}</div>
          {lesson.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
              {lesson.description.length > 70
                ? `${lesson.description.substring(0, 70)}...`
                : lesson.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell px-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-normal bg-gray-100 text-gray-700">
          {lesson.type === 'video' && 'Vídeo'}
          {lesson.type === 'text' && 'Texto'}
          {lesson.type === 'quiz' && 'Quiz'}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell px-4">
        <span className="text-xs text-gray-500">{lesson.duration || '-'}</span>
      </TableCell>
      {isAdmin && (
        <TableCell className="text-right px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600">
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
      {!isAdmin && <TableCell className="text-right px-4"></TableCell>}
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
      <div className="text-center py-16 border border-gray-200 rounded-lg bg-white">
        <FileText className="mx-auto h-10 w-10 text-gray-300 mb-4" />
        <h3 className="text-sm font-medium text-gray-700 mb-2">Nenhuma aula cadastrada</h3>
        <p className="text-xs text-gray-500 mb-6">
          Comece adicionando a primeira aula para este curso.
        </p>
        {isAdmin && (
          <Button 
            onClick={onAddLesson} 
            variant="outline"
            size="sm" 
            className="gap-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-normal"
          >
            <Plus className="h-4 w-4" />
            Adicionar Aula
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-white border-b border-gray-200">
                {isAdmin && <TableHead className="w-[50px] h-12 px-4"></TableHead>}
                <TableHead className="w-[50px] h-12 px-4 text-xs font-medium text-gray-600">#</TableHead>
                <TableHead className="h-12 px-4 text-xs font-medium text-gray-600">Título</TableHead>
                <TableHead className="hidden md:table-cell w-[100px] h-12 px-4 text-xs font-medium text-gray-600">Tipo</TableHead>
                <TableHead className="hidden md:table-cell w-[90px] h-12 px-4 text-xs font-medium text-gray-600">Duração</TableHead>
                {isAdmin && <TableHead className="text-right w-[70px] h-12 px-4 text-xs font-medium text-gray-600">Ações</TableHead>}
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
