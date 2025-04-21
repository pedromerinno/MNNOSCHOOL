
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";

export const useCompanyContent = () => {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [companyColor, setCompanyColor] = useState<string>("#1EAEDB");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Efeito para atualizar a cor quando a empresa muda
  useEffect(() => {
    if (selectedCompany) {
      setCompanyColor(selectedCompany.cor_principal || "#1EAEDB");
      setCompanyId(selectedCompany.id);
      setIsLoadingContent(false);
    } else {
      setIsLoadingContent(companyLoading);
    }
  }, [selectedCompany, companyLoading]);

  // Ouvinte para eventos de empresa
  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail?.company;
      
      if (updatedCompany?.cor_principal) {
        console.log(`[useCompanyContent] Company update event received, updating color to ${updatedCompany.cor_principal}`);
        setCompanyColor(updatedCompany.cor_principal);
      }
      
      if (updatedCompany?.id) {
        setCompanyId(updatedCompany.id);
      }
    };
    
    // Registrar eventos relacionados a alterações de empresa
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    window.addEventListener('company-relation-changed', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
      window.removeEventListener('company-relation-changed', handleCompanyUpdate);
    };
  }, []);

  // Função para buscar dados relacionados à empresa com base no tipo
  const fetchCompanyRelatedData = useCallback(async (tableName: string, limit: number = 10) => {
    if (!companyId) return [];
    
    try {
      // Use the "from" method with type assertion to avoid the type error
      // The issue was that tableName was a string variable, not a literal type expected by Supabase
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('company_id', companyId)
        .limit(limit);
        
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching ${tableName} for company ${companyId}:`, error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
      return [];
    }
  }, [companyId]);

  return {
    companyId,
    companyColor,
    isLoadingContent,
    fetchCompanyRelatedData,
    selectedCompany
  };
};
