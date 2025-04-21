
import { useState, useEffect, useCallback } from "react";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";
import type { Company } from "@/types/company";

interface CompanyInfo {
  id: string;
  nome: string;
  logo?: string | null;
}

export function useExistingCompany(companyId: string) {
  const { companyInfo, loading: companyLoading, fetchCompany } = useQuickCompanyLookup();
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  const handleCompanyLookup = useCallback(
    async (info: CompanyInfo | null, lookupPending: boolean): Promise<void> => {
      console.log("Looking up company with ID:", companyId, "lookupPending:", lookupPending);
      
      if (lookupPending) {
        // Se lookup está pendente, não esconde a informação ainda
        return;
      }
      
      setShowCompanyInfo(false);
      
      if (companyId && companyId.length >= 10) {
        try {
          // Executa a busca e aguarda sua conclusão
          await fetchCompany(companyId);
          
          // Depois que a busca é concluída, registra no console o estado atual
          console.log("Company lookup result after fetch:", companyInfo);
        } catch (error) {
          console.error("Error during company lookup:", error);
        }
      }
    },
    [companyId, companyInfo, fetchCompany]
  );

  useEffect(() => {
    // Redefine as informações visíveis quando o ID muda
    if (!companyId || companyId.length < 10) {
      setShowCompanyInfo(false);
    }
  }, [companyId]);

  useEffect(() => {
    // Atualiza showCompanyInfo quando companyInfo muda
    if (companyInfo) {
      setShowCompanyInfo(true);
    }
  }, [companyInfo]);

  return { 
    companyInfo, 
    companyLoading, 
    showCompanyInfo, 
    setShowCompanyInfo, 
    handleCompanyLookup 
  };
}
