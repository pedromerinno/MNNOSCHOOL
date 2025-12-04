
import React from 'react';
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Search, GraduationCap } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';

interface CourseListEmptyStateProps {
  filter?: string;
}

export const CourseListEmptyState: React.FC<CourseListEmptyStateProps> = ({ filter }) => {
  const { selectedCompany } = useCompanies();
  
  const description = selectedCompany 
    ? `Não foram encontrados cursos para a empresa ${selectedCompany.nome}${filter !== 'all' ? ' que correspondam aos filtros selecionados' : ''}.`
    : 'Por favor, selecione uma empresa para ver os cursos disponíveis.';

  return (
    <div className="flex justify-center py-8">
      <EmptyState
        title="Nenhum curso encontrado"
        description={description}
        icons={filter !== 'all' ? [Search, BookOpen] : [BookOpen, GraduationCap]}
      />
    </div>
  );
};
