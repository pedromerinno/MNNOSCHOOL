
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
  
  // Prevent default navigation/reloads when handling form submission
  // Return a Promise to match the expected type signature
  const onFormSubmit = async (data: any): Promise<void> => {
    try {
      await handleFormSubmit(data);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Ocorreu um erro ao salvar as configurações");
    }
  };
  
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="mb-2 px-0 py-[10px] text-xl font-semibold">Configurações de Integração</h3>
          <p className="mb-4 text-gray-400 text-sm">
            Gerencie as configurações de integração da empresa
          </p>
        </div>
        {/* Organizar seletor de empresa para ficar mais harmonico */}
        <div className="flex w-full md:w-auto items-end justify-end">
          <CompanySelector companies={companies} selectedCompany={selectedCompany} onCompanyChange={handleCompanyChange} disabled={companies.length === 0 || isLoading} />
        </div>
      </div>

      {selectedCompany ? <Card>
          <CardContent className="p-4 py-[30px] px-[30px]">
            <SettingsTabs company={selectedCompany} activeTab={activeTab} setActiveTab={setActiveTab} handleFormSubmit={onFormSubmit} isSaving={isSaving} />
          </CardContent>
        </Card> : <NoCompanySelected />}
    </div>;
};
