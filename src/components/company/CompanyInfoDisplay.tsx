
import React from 'react';
import { useSelectedCompanyDisplay } from '@/hooks/company/useSelectedCompanyDisplay';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyInfoDisplayProps {
  renderInfo: (company: any) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;
}

/**
 * Componente para exibir informações da empresa selecionada com tratamento de estados
 */
export const CompanyInfoDisplay: React.FC<CompanyInfoDisplayProps> = ({
  renderInfo,
  loadingFallback,
  emptyFallback
}) => {
  const { company, isLoading, companyLoaded } = useSelectedCompanyDisplay();

  // Estado de carregamento
  if (isLoading) {
    return loadingFallback ? (
      <>{loadingFallback}</>
    ) : (
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Estado sem empresa
  if (!company) {
    return emptyFallback ? (
      <>{emptyFallback}</>
    ) : (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Nenhuma empresa selecionada</p>
      </div>
    );
  }

  // Renderiza as informações da empresa
  return <>{renderInfo(company)}</>;
};
