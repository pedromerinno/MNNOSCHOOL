
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/useCompanies";

export const useSettingsManagement = () => {
  // Use useCompanies without skipLoadingInOnboarding to ensure companies are loaded
  const { userCompanies, isLoading: isLoadingCompanies, fetchCompanies, selectedCompany: globalSelectedCompany } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const hasLoadedCompanies = useRef(false);
  const hasInitialized = useRef(false);

  console.log('[useSettingsManagement] Hook state:', {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    globalSelectedCompany: globalSelectedCompany?.nome || 'none',
    isLoadingCompanies
  });

  // Ordenar empresas para que a empresa selecionada globalmente apareça primeiro
  const companies = userCompanies.slice().sort((a, b) => {
    if (globalSelectedCompany) {
      if (a.id === globalSelectedCompany.id) return -1;
      if (b.id === globalSelectedCompany.id) return 1;
    }
    return a.nome.localeCompare(b.nome);
  });

  // Load companies if not loaded
  useEffect(() => {
    const loadCompanies = async () => {
      if (!hasLoadedCompanies.current && !isLoadingCompanies && userCompanies.length === 0) {
        console.log("[useSettingsManagement] Loading companies - Initial Load");
        hasLoadedCompanies.current = true;
        await fetchCompanies();
      }
    };
    loadCompanies();
  }, [fetchCompanies, isLoadingCompanies, userCompanies.length]);

  // Initialize selected company when companies are available
  useEffect(() => {
    if (!hasInitialized.current && companies.length > 0) {
      console.log('[useSettingsManagement] Initializing selected company');
      hasInitialized.current = true;
      
      // First priority: global selected company if it exists in user companies
      if (globalSelectedCompany && companies.some(c => c.id === globalSelectedCompany.id)) {
        console.log("[useSettingsManagement] Using global selected company:", globalSelectedCompany.nome);
        setSelectedCompany(globalSelectedCompany);
        
        window.dispatchEvent(new CustomEvent('settings-company-changed', { 
          detail: { company: globalSelectedCompany } 
        }));
      }
      // Second priority: first available company
      else {
        console.log("[useSettingsManagement] Using first available company:", companies[0].nome);
        setSelectedCompany(companies[0]);
        
        window.dispatchEvent(new CustomEvent('settings-company-changed', { 
          detail: { company: companies[0] } 
        }));
      }
    }
  }, [companies, globalSelectedCompany]);

  // Listen for global company changes
  useEffect(() => {
    const handleGlobalCompanyChange = (event: CustomEvent<{company: Company}>) => {
      const newCompany = event.detail.company;
      
      // Only update if the company is in our available companies and different from current
      if (companies.some(c => c.id === newCompany.id) && (!selectedCompany || selectedCompany.id !== newCompany.id)) {
        console.log("[useSettingsManagement] Global company changed, updating selected company:", newCompany.nome);
        setSelectedCompany(newCompany);
      }
    };

    window.addEventListener('company-changed', handleGlobalCompanyChange as EventListener);
    window.addEventListener('company-navigation-change', handleGlobalCompanyChange as EventListener);
    window.addEventListener('company-selected', handleGlobalCompanyChange as EventListener);
    
    return () => {
      window.removeEventListener('company-changed', handleGlobalCompanyChange as EventListener);
      window.removeEventListener('company-navigation-change', handleGlobalCompanyChange as EventListener);
      window.removeEventListener('company-selected', handleGlobalCompanyChange as EventListener);
    };
  }, [companies, selectedCompany]);

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
      
      // Update the selected company locally
      const updatedCompany = {
        ...selectedCompany,
        ...processedData
      };
      
      setSelectedCompany(updatedCompany);
      
      toast.success("Informações de integração atualizadas com sucesso");
      
      // Dispatch event to update company data in other components
      window.dispatchEvent(new CustomEvent('company-updated', { 
        detail: { company: updatedCompany } 
      }));
      
      // Trigger refresh event for other components
      window.dispatchEvent(new Event('company-relation-changed'));
      
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
