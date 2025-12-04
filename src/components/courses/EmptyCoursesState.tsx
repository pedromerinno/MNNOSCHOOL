
import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap, BookOpen, PlusCircle } from "lucide-react";

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
    <div className="col-span-3 flex justify-center py-12">
      <EmptyState
        title="Nenhum curso disponível"
        description={`Não há cursos disponíveis para ${companyName}.`}
        icons={[GraduationCap, BookOpen, PlusCircle]}
        action={isAdmin ? {
          label: "Criar um novo curso",
          onClick: onCreateCourse
        } : undefined}
      />
    </div>
  );
};
