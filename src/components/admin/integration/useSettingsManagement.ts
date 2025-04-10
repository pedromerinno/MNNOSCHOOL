
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/useCompanies";

export const useSettingsManagement = () => {
  const { companies, isLoading, fetchCompanies } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const hasLoadedCompanies = useRef(false);

  // Fetch companies only once on mount
  useEffect(() => {
    const loadCompanies = async () => {
      if (!hasLoadedCompanies.current && !isLoading) {
        console.log("Loading companies in SettingsManagement - Initial Load");
        hasLoadedCompanies.current = true;
        await fetchCompanies();
      }
    };
    loadCompanies();
  }, [fetchCompanies, isLoading]);

  // Set the first company as selected if none is selected yet
  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      console.log("Setting initial selected company:", companies[0].nome);
      setSelectedCompany(companies[0]);
    }
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

  // Listen for company-updated events to update the selected company
  useEffect(() => {
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      if (selectedCompany && updatedCompany.id === selectedCompany.id) {
        console.log("Updating selected company with latest data:", updatedCompany.nome);
        setSelectedCompany(updatedCompany);
      }
    };
    
    window.addEventListener('company-updated', handleCompanyUpdated as EventListener);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdated as EventListener);
    };
  }, [selectedCompany]);

  const handleFormSubmit = async (formData: any) => {
    if (!selectedCompany) {
      toast.error("Nenhuma empresa selecionada");
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log("Saving integration info for company:", selectedCompany.nome);
      
      const { error } = await supabase
        .from('empresas')
        .update(formData)
        .eq('id', selectedCompany.id);
        
      if (error) throw error;
      
      // Update the selected company locally
      const updatedCompany = {
        ...selectedCompany,
        ...formData
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
    isLoading,
    selectedCompany,
    isSaving,
    activeTab,
    setActiveTab,
    handleCompanyChange,
    handleFormSubmit
  };
};
