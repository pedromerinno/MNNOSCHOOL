
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanySync } from "@/hooks/company/useCompanySync";

export const useSettingsManagement = () => {
  const { 
    userCompanies, 
    isLoading: isLoadingCompanies, 
    selectedCompany: globalSelectedCompany,
    forceGetUserCompanies,
    user
  } = useCompanies();
  
  const { syncCompanyData, forceCompanyUpdate } = useCompanySync();
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("type");
  const hasInitialized = useRef(false);

  // Use the global selected company directly
  const selectedCompany = globalSelectedCompany;

  console.log('[useSettingsManagement] Hook state:', {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    isLoadingCompanies,
    userId: user?.id || 'no user'
  });

  // Force load companies if we have a user but no companies
  useEffect(() => {
    if (user?.id && !isLoadingCompanies && userCompanies.length === 0 && !hasInitialized.current) {
      console.log('[useSettingsManagement] No companies loaded, forcing fetch...');
      hasInitialized.current = true;
      forceGetUserCompanies(user.id).catch(error => {
        console.error('[useSettingsManagement] Error forcing companies fetch:', error);
      });
    }
  }, [user?.id, isLoadingCompanies, userCompanies.length, forceGetUserCompanies]);

  // Reset phase to type when company changes to ensure proper content loading
  useEffect(() => {
    if (globalSelectedCompany) {
      setActiveTab("type");
    }
  }, [globalSelectedCompany?.id]);

  const handleFormSubmit = async (formData: any) => {
    if (!selectedCompany) {
      toast.error("Nenhuma empresa selecionada");
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log("Saving integration info for company:", selectedCompany.nome);
      
      // Process valores field if it's an array (always stringify arrays for storage)
      let processedData = { ...formData };
      
      // Handle the valores field correctly - always stringify arrays before saving
      if (processedData.valores) {
        if (Array.isArray(processedData.valores)) {
          processedData.valores = JSON.stringify(processedData.valores);
        }
      }
      
      const { error } = await supabase
        .from('empresas')
        .update(processedData)
        .eq('id', selectedCompany.id);
        
      if (error) throw error;
      
      // Update the selected company with new data
      const updatedCompany = {
        ...selectedCompany,
        ...processedData
      };
      
      toast.success("Informações de integração atualizadas com sucesso");
      
      // Use the sync utility to propagate changes everywhere
      syncCompanyData(updatedCompany);
      
      // Force update global company state
      forceCompanyUpdate(updatedCompany);
      
    } catch (error: any) {
      console.error("Erro ao salvar informações:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading: isLoadingCompanies,
    selectedCompany,
    isSaving,
    activeTab,
    setActiveTab,
    handleFormSubmit
  };
};
