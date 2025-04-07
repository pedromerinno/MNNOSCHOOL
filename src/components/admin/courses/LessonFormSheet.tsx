
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { LessonForm } from './LessonForm';
import { Lesson } from '@/components/courses/CourseLessonList';

interface LessonFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLesson?: Lesson;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export const LessonFormSheet: React.FC<LessonFormSheetProps> = ({
  isOpen,
  onClose,
  selectedLesson,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
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
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
