import React from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { FileText, Building, User } from 'lucide-react';

interface DocumentStatsCardsProps {
  companyCount: number;
  personalCount: number;
  companyColor: string;
  isLoadingCompany?: boolean;
  isLoadingPersonal?: boolean;
}

export const DocumentStatsCards: React.FC<DocumentStatsCardsProps> = ({
  companyCount,
  personalCount,
  companyColor,
  isLoadingCompany = false,
  isLoadingPersonal = false,
}) => {
  const totalCount = companyCount + personalCount;
  const isLoadingTotal = isLoadingCompany || isLoadingPersonal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<FileText className="w-5 h-5" />}
        title="Total de Documentos"
        value={totalCount}
        loading={isLoadingTotal}
      />
      <StatCard
        icon={<Building className="w-5 h-5" />}
        title="Documentos da Empresa"
        value={companyCount}
        loading={isLoadingCompany}
      />
      <StatCard
        icon={<User className="w-5 h-5" />}
        title="Meus Documentos"
        value={personalCount}
        loading={isLoadingPersonal}
      />
    </div>
  );
};


