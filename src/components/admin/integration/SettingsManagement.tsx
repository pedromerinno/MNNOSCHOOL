
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSettingsManagement } from './useSettingsManagement';
import { CompanySelector } from '@/components/admin/integration/CompanySelector';
import { SettingsTabs } from './SettingsTabs';
import { NoCompanySelected } from './NoCompanySelected';
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
  
  console.log('[SettingsManagement] Current state:', {
    companiesCount: companies.length,
    isLoading,
    selectedCompany: selectedCompany?.nome || 'none'
  });
  
  // Função de envio de formulário melhorada para garantir tratamento adequado de promises
  const onFormSubmit = async (data: any): Promise<void> => {
    try {
      // Prevenção explícita de comportamento padrão caso seja chamado de um evento
      if (data?.preventDefault) {
        data.preventDefault();
        data.stopPropagation();
      }
      
      // Aguarda a conclusão da promise para garantir que o processo seja finalizado
      await handleFormSubmit(data);
      // A mensagem de toast de sucesso é tratada em handleFormSubmit
    } catch (error) {
      console.error("Erro no envio do formulário:", error);
      toast.error("Ocorreu um erro ao salvar as configurações");
    }
    
    // Impede o recarregamento da página após o envio do formulário
    return Promise.resolve();
  };
  
  // Show loading state while companies are being fetched
  if (isLoading && companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="mb-2 px-0 py-[10px] text-xl font-semibold">Configurações de Integração</h3>
            <p className="mb-4 text-gray-400 text-sm">
              Gerencie as configurações de integração da empresa
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="text-gray-600">Carregando empresas...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="mb-2 px-0 py-[10px] text-xl font-semibold">Configurações de Integração</h3>
          <p className="mb-4 text-gray-400 text-sm">
            Gerencie as configurações de integração da empresa
          </p>
        </div>
        {/* Organizar seletor de empresa para ficar mais harmonico */}
        <div className="flex w-full md:w-auto items-end justify-end">
          <CompanySelector 
            companies={companies} 
            selectedCompany={selectedCompany} 
            onCompanyChange={handleCompanyChange} 
            disabled={companies.length === 0 || isLoading} 
          />
        </div>
      </div>

      {selectedCompany ? (
        <Card>
          <CardContent className="p-4 py-[30px] px-[30px]">
            <SettingsTabs 
              company={selectedCompany} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              handleFormSubmit={onFormSubmit} 
              isSaving={isSaving} 
            />
          </CardContent>
        </Card>
      ) : (
        <NoCompanySelected />
      )}
    </div>
  );
};
