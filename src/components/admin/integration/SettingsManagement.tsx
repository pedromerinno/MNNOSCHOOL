
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsManagement } from './useSettingsManagement';
import { CompanySelector } from '@/components/admin/integration/CompanySelector';
import { SettingsTabs } from './SettingsTabs';
import { NoCompanySelected } from './NoCompanySelected';
import { LoadingState } from './LoadingState';
import { BackgroundManager } from '../BackgroundManager';
import { toast } from 'sonner';

export const SettingsManagement: React.FC = () => {
  const {
    companies,
    isLoading,
    selectedCompany,
    isSaving,
    activeTab,
    setActiveTab,
    handleCompanyChange,
    handleFormSubmit
  } = useSettingsManagement();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Configurações e Gerenciamento</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie configurações, conteúdo e recursos da plataforma
          </p>
        </div>
        
        <CompanySelector
          companies={companies}
          selectedCompany={selectedCompany}
          onCompanyChange={handleCompanyChange}
          disabled={companies.length === 0 || isLoading}
        />
      </div>

      {selectedCompany ? (
        <Card>
          <CardContent className="p-0">
            <SettingsTabs
              company={selectedCompany}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleFormSubmit={handleFormSubmit}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      ) : (
        <NoCompanySelected />
      )}

      <Card>
        <CardContent>
          <BackgroundManager />
        </CardContent>
      </Card>
    </div>
  );
};
