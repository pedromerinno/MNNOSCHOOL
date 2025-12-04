
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Settings } from "lucide-react";
import { useSettingsManagement } from './useSettingsManagement';
import { SettingsTabs } from './SettingsTabs';
import { NoCompanySelected } from './NoCompanySelected';
import { toast } from 'sonner';
import { useCompanySync } from '@/hooks/company/useCompanySync';
import { AdminPageTitle } from '../AdminPageTitle';

export const SettingsManagement: React.FC = () => {
  const {
    isLoading,
    selectedCompany,
    isSaving,
    activeTab,
    setActiveTab,
    handleFormSubmit
  } = useSettingsManagement();
  
  const { syncCompanyData } = useCompanySync();
  
  console.log('[SettingsManagement] Current state:', {
    isLoading,
    selectedCompany: selectedCompany?.nome || 'none'
  });
  
  // Função de envio de formulário melhorada para garantir sincronização adequada
  const onFormSubmit = async (data: any): Promise<void> => {
    try {
      // Prevenção explícita de comportamento padrão caso seja chamado de um evento
      if (data?.preventDefault) {
        data.preventDefault();
        data.stopPropagation();
      }
      
      // Aguarda a conclusão da promise para garantir que o processo seja finalizado
      await handleFormSubmit(data);
      
      // Força sincronização completa após salvar
      if (selectedCompany) {
        const updatedCompany = { ...selectedCompany, ...data };
        syncCompanyData(updatedCompany);
        
        // Força reload de dados relacionados à empresa
        window.dispatchEvent(new CustomEvent('company-data-updated', { 
          detail: { company: updatedCompany } 
        }));
        
        // Força atualização global do estado da empresa
        window.dispatchEvent(new CustomEvent('force-company-refresh', { 
          detail: { companyId: selectedCompany.id } 
        }));
      }
      
    } catch (error) {
      console.error("Erro no envio do formulário:", error);
      toast.error("Ocorreu um erro ao salvar as configurações");
    }
    
    // Impede o recarregamento da página após o envio do formulário
    return Promise.resolve();
  };
  
  // Show loading state while companies are being fetched
  if (isLoading && !selectedCompany) {
    return (
      <div className="space-y-6">
        <AdminPageTitle
          title="Configurações"
          description="Gerencie as configurações de integração da empresa"
          size="xl"
        />
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="text-sm text-muted-foreground">Carregando configurações...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Configurações"
        description="Gerencie as configurações de integração da empresa selecionada"
        size="xl"
      />

      {selectedCompany ? (
        <SettingsTabs 
          company={selectedCompany} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          handleFormSubmit={onFormSubmit} 
          isSaving={isSaving} 
        />
      ) : (
        <NoCompanySelected />
      )}
    </div>
  );
};
