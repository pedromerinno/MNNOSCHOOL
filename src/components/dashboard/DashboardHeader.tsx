
import { useCompanies } from "@/hooks/useCompanies";
import { useState, useEffect } from "react";

export const DashboardHeader = () => {
  const { selectedCompany } = useCompanies();
  
  // Estado local para cor com inicialização
  const [headerBgColor, setHeaderBgColor] = useState<string>("transparent");
  
  // Atualizar a cor quando a empresa selecionada mudar
  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      console.log(`DashboardHeader: Atualizando cor para ${selectedCompany.cor_principal}`);
      setHeaderBgColor(`${selectedCompany.cor_principal}05`); // 5% de opacidade
    }
  }, [selectedCompany]);
  
  return null; // Remove the entire header component
};

