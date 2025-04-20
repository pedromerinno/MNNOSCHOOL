
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useState, useEffect } from "react";

export const DashboardHeader = () => {
  const { selectedCompany } = useCompanies();
  const { getInitialSelectedCompany } = useCompanyCache();
  
  // Estado local para cor com inicialização imediata do cache
  const [headerBgColor, setHeaderBgColor] = useState<string>("transparent");
  
  // Tentar obter a cor na inicialização
  useEffect(() => {
    try {
      const cachedCompany = getInitialSelectedCompany();
      if (cachedCompany?.cor_principal) {
        // Usar a cor com opacidade muito baixa
        setHeaderBgColor(`${cachedCompany.cor_principal}05`); // 5% de opacidade
      }
    } catch (e) {
      console.error("Erro ao obter cor inicial:", e);
    }
  }, []);
  
  // Atualizar a cor quando a empresa selecionada mudar
  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      setHeaderBgColor(`${selectedCompany.cor_principal}05`); // 5% de opacidade
    }
  }, [selectedCompany]);
  
  return (
    <div 
      className="container mx-auto px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-background"
      style={{ 
        backgroundColor: headerBgColor 
      }}
    >
      <div className="flex items-center justify-end">
        {/* Empty container for potential future elements */}
      </div>
    </div>
  );
};
