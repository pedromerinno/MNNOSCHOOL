import React from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { LockKeyhole, Network, UserCircle } from 'lucide-react';

interface AccessStatsCardsProps {
  sharedCount: number;
  personalCount: number;
  companyColor?: string;
  isLoadingShared?: boolean;
  isLoadingPersonal?: boolean;
}

export const AccessStatsCards: React.FC<AccessStatsCardsProps> = ({
  sharedCount,
  personalCount,
  isLoadingShared = false,
  isLoadingPersonal = false,
}) => {
  const totalCount = sharedCount + personalCount;
  const isLoadingTotal = isLoadingShared || isLoadingPersonal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<LockKeyhole className="w-5 h-5" />}
        title="Total de Senhas"
        value={totalCount}
        loading={isLoadingTotal}
      />
      <StatCard
        icon={<Network className="w-5 h-5" />}
        title="Senhas da Empresa"
        value={sharedCount}
        loading={isLoadingShared}
      />
      <StatCard
        icon={<UserCircle className="w-5 h-5" />}
        title="Minhas Senhas"
        value={personalCount}
        loading={isLoadingPersonal}
      />
    </div>
  );
};

