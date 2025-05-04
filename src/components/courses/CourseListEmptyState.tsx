
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';

interface CourseListEmptyStateProps {
  filter?: string;
}

export const CourseListEmptyState: React.FC<CourseListEmptyStateProps> = ({ filter }) => {
  const { selectedCompany } = useCompanies();
  
  return (
    <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg border-gray-200 dark:border-gray-800 text-center">
      <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        Nenhum curso encontrado
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        {selectedCompany 
          ? `Não foram encontrados cursos para a empresa ${selectedCompany.nome} ${filter !== 'all' ? 'que correspondam aos filtros selecionados' : ''}.`
          : 'Por favor, selecione uma empresa para ver os cursos disponíveis.'}
      </p>
    </div>
  );
};
