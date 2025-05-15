
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/company";

export const useSettingsManagement = () => {
  const { companies: allCompanies, isLoading: isLoadingCompanies, fetchCompanies, userCompanies } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const hasLoadedCompanies = useRef(false);
  const lastEventTimeRef = useRef<number>(0);
  const isProcessingEventRef = useRef<boolean>(false);

  // Use userCompanies instead of all companies for admins
  const companies = userCompanies;

  // Improved loading logic with better memoization
  useEffect(() => {
    if (!hasLoadedCompanies.current && !isLoadingCompanies) {
      console.log("Loading companies in SettingsManagement - Initial Load");
      hasLoadedCompanies.current = true;
      fetchCompanies();
    }
  }, [fetchCompanies, isLoadingCompanies]);

  // Throttled company selection
  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      console.log("Setting initial selected company:", companies[0].nome);
      setSelectedCompany(companies[0]);
      
      // Throttle the event dispatch
      const now = Date.now();
      if (now - lastEventTimeRef.current > 1000 && !isProcessingEventRef.current) {
        lastEventTimeRef.current = now;
        isProcessingEventRef.current = true;
        
        // Use setTimeout to prevent excessive event dispatches
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('settings-company-changed', { 
            detail: { company: companies[0] } 
          }));
          isProcessingEventRef.current = false;
        }, 50);
      }
    }
  }, [companies, selectedCompany]);

  // Improved company change handler with debounce
  const handleCompanyChange = useCallback((companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      console.log("Company changed to:", company.nome);
      setSelectedCompany(company);
      
      // Reset tab to info when changing company to ensure proper content loading
      setActiveTab("info");
      
      // Throttle event dispatch
      const now = Date.now();
      if (now - lastEventTimeRef.current > 1000 && !isProcessingEventRef.current) {
        lastEventTimeRef.current = now;
        isProcessingEventRef.current = true;
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('settings-company-changed', { 
            detail: { company } 
          }));
          isProcessingEventRef.current = false;
        }, 50);
      }
    }
  }, [companies]);

  // Optimized form submission
  const handleFormSubmit = useCallback(async (formData: any) => {
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
      
      // Dispatch single consolidated event with debounce
      const now = Date.now();
      if (now - lastEventTimeRef.current > 2000) {
        lastEventTimeRef.current = now;
        
        // Use a single timeout for all events to prevent cascades
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('company-updated', { 
            detail: { company: updatedCompany } 
          }));
          
          // Delay the relation-changed event to prevent race conditions
          setTimeout(() => {
            window.dispatchEvent(new Event('company-relation-changed'));
          }, 300);
        }, 100);
      }
      
    } catch (error: any) {
      console.error("Erro ao salvar informações:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [selectedCompany]);

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
