
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
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const hasInitialized = useRef(false);

  console.log('[useSettingsManagement] Hook state:', {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    globalSelectedCompany: globalSelectedCompany?.nome || 'none',
    isLoadingCompanies,
    userId: user?.id || 'no user'
  });

  // Ordenar empresas para que a empresa selecionada globalmente apareça primeiro
  const companies = userCompanies.slice().sort((a, b) => {
    if (globalSelectedCompany) {
      if (a.id === globalSelectedCompany.id) return -1;
      if (b.id === globalSelectedCompany.id) return 1;
    }
    return a.nome.localeCompare(b.nome);
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

  // Initialize selected company when companies are available
  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      console.log('[useSettingsManagement] Initializing selected company');
      
      // First priority: global selected company if it exists in user companies
      if (globalSelectedCompany && companies.some(c => c.id === globalSelectedCompany.id)) {
        console.log("[useSettingsManagement] Using global selected company:", globalSelectedCompany.nome);
        setSelectedCompany(globalSelectedCompany);
      }
      // Second priority: first available company
      else if (companies.length > 0) {
        console.log("[useSettingsManagement] Using first available company:", companies[0].nome);
        setSelectedCompany(companies[0]);
      }
    }
  }, [companies, globalSelectedCompany, selectedCompany]);

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      console.log("Company changed to:", company.nome);
      setSelectedCompany(company);
      
      // Reset tab to info when changing company to ensure proper content loading
      setActiveTab("info");
      
      // Broadcast company change for other components to react
      window.dispatchEvent(new CustomEvent('settings-company-changed', { 
        detail: { company } 
      }));
    }
  };

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
      
      // Update the selected company locally with new data
      const updatedCompany = {
        ...selectedCompany,
        ...processedData
      };
      
      // CRITICAL: Update local state FIRST
      setSelectedCompany(updatedCompany);
      
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
    companies,
    isLoading: isLoadingCompanies,
    selectedCompany,
    isSaving,
    activeTab,
    setActiveTab,
    handleCompanyChange,
    handleFormSubmit
  };
};
