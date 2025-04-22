
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyCoursesStateProps {
  companyName: string;
  isAdmin: boolean;
  onCreateCourse: () => void;
}

export const EmptyCoursesState: React.FC<EmptyCoursesStateProps> = ({
  companyName,
  isAdmin,
  onCreateCourse,
}) => {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
      <div className="max-w-md">
        <h3 className="text-xl font-semibold mb-2">Nenhum curso disponível</h3>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
          Não há cursos disponíveis para {companyName}.
        </p>
        {isAdmin && (
          <Button onClick={onCreateCourse} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Criar um novo curso
          </Button>
        )}
      </div>
    </div>
  );
};
