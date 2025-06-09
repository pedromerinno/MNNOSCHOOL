
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/useCompanies";

export const useSettingsManagement = () => {
  const { userCompanies, isLoading: isLoadingCompanies, fetchCompanies, selectedCompany: globalSelectedCompany } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const hasLoadedCompanies = useRef(false);

  // Ordenar empresas para que a empresa selecionada globalmente apareça primeiro
  const companies = userCompanies.slice().sort((a, b) => {
    if (globalSelectedCompany) {
      if (a.id === globalSelectedCompany.id) return -1;
      if (b.id === globalSelectedCompany.id) return 1;
    }
    return a.nome.localeCompare(b.nome);
  });

  useEffect(() => {
    const loadCompanies = async () => {
      if (!hasLoadedCompanies.current && !isLoadingCompanies) {
        console.log("Loading companies in SettingsManagement - Initial Load");
        hasLoadedCompanies.current = true;
        await fetchCompanies();
      }
    };
    loadCompanies();
  }, [fetchCompanies, isLoadingCompanies]);

  // Priorizar a empresa selecionada globalmente
  useEffect(() => {
    if (companies.length > 0) {
      // Se há uma empresa selecionada globalmente e ela está nas empresas disponíveis, use ela
      if (globalSelectedCompany && companies.some(c => c.id === globalSelectedCompany.id)) {
        if (!selectedCompany || selectedCompany.id !== globalSelectedCompany.id) {
          console.log("Setting selected company to global selected company:", globalSelectedCompany.nome);
          setSelectedCompany(globalSelectedCompany);
          
          window.dispatchEvent(new CustomEvent('settings-company-changed', { 
            detail: { company: globalSelectedCompany } 
          }));
        }
      }
      // Se não há empresa selecionada, use a primeira da lista
      else if (!selectedCompany) {
        console.log("Setting initial selected company:", companies[0].nome);
        setSelectedCompany(companies[0]);
        
        window.dispatchEvent(new CustomEvent('settings-company-changed', { 
          detail: { company: companies[0] } 
        }));
      }
    }
  }, [companies, selectedCompany, globalSelectedCompany]);

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
