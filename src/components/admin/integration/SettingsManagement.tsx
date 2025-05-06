import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsManagement } from './useSettingsManagement';
import { CompanySelector } from '@/components/admin/integration/CompanySelector';
import { SettingsTabs } from './SettingsTabs';
import { NoCompanySelected } from './NoCompanySelected';
import { LoadingState } from './LoadingState';
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
  return <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-left">
        <div>
          <h2 className="text-xl font-semibold mb-1">Configurações da Empresa</h2>
          
        </div>
        {/* Organizar seletor de empresa para ficar mais harmonico */}
        <div className="flex w-full md:w-auto items-end justify-end">
          <CompanySelector companies={companies} selectedCompany={selectedCompany} onCompanyChange={handleCompanyChange} disabled={companies.length === 0 || isLoading} />
        </div>
      </div>

      {selectedCompany ? <Card>
          <CardContent className="p-4 py-[30px] px-[30px]">
            <SettingsTabs company={selectedCompany} activeTab={activeTab} setActiveTab={setActiveTab} handleFormSubmit={handleFormSubmit} isSaving={isSaving} />
          </CardContent>
        </Card> : <NoCompanySelected />}
    </div>;
};