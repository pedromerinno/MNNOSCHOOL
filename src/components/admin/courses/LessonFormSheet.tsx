
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LessonForm } from './LessonForm';
import { Lesson } from '@/components/courses/CourseLessonList';
import { useCompanies } from '@/hooks/useCompanies';

interface LessonFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLesson?: Lesson;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  courseId: string;
}

export const LessonFormSheet: React.FC<LessonFormSheetProps> = ({
  isOpen,
  onClose,
  selectedLesson,
  onSubmit,
  isSubmitting,
  courseId
}) => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const handleSubmit = () => {
    const form = document.getElementById('lesson-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col h-full [&>button]:hidden"
      >
        <SheetHeader className="px-6 py-5 border-b border-gray-200">
          <SheetTitle className="text-base font-semibold text-gray-900">
            {selectedLesson ? 'Editar Aula' : 'Criar Nova Aula'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto bg-white flex flex-col">
          <div className="p-6 flex-1">
            <LessonForm 
              initialData={selectedLesson}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onCancel={onClose}
              courseId={courseId}
            />
          </div>
          
          {/* Footer with buttons */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              size="sm"
              className="min-w-[100px] border-gray-300 hover:bg-gray-50 text-gray-700 font-normal"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="sm"
              className="min-w-[100px] font-normal"
              style={{ 
                backgroundColor: companyColor,
                borderColor: companyColor
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Salvando...
                </span>
              ) : (
                selectedLesson ? 'Atualizar Aula' : 'Adicionar Aula'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
