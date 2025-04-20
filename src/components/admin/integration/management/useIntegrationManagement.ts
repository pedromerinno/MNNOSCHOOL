
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/useCompanies";

export const useIntegrationManagement = () => {
  const { companies, isLoading: isLoadingCompanies, fetchCompanies } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const hasLoadedCompanies = useRef(false);

  useEffect(() => {
    const loadCompanies = async () => {
      if (!hasLoadedCompanies.current && !isLoadingCompanies) {
        console.log("Loading companies in IntegrationManagement - Initial Load");
        hasLoadedCompanies.current = true;
        await fetchCompanies();
      }
    };
    loadCompanies();
  }, [fetchCompanies, isLoadingCompanies]);

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
      
      // Process valores field properly
      let processedData = { ...formData };
      
      // Handle the valores field correctly - ensure it's saved as a valid JSON string
      if (processedData.valores) {
        if (typeof processedData.valores === 'string') {
          try {
            // Try to parse it to validate it's proper JSON
            JSON.parse(processedData.valores);
            // If no error, it's already valid JSON string
          } catch (e) {
            // If it's not valid JSON, convert to JSON string
            processedData.valores = JSON.stringify(processedData.valores);
          }
        } else if (Array.isArray(processedData.valores)) {
          // If it's an array, stringify it
          processedData.valores = JSON.stringify(processedData.valores);
        }
      }
      
      const { error } = await supabase
        .from('empresas')
        .update(processedData)
        .eq('id', selectedCompany.id);
        
      if (error) throw error;
      
      // Atualizar o objeto da empresa selecionada localmente
      setSelectedCompany({
        ...selectedCompany,
        ...processedData
      });
      
      toast.success("Informações de integração atualizadas com sucesso");
      
      // Disparar evento para atualizar dados da empresa em outros componentes
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
