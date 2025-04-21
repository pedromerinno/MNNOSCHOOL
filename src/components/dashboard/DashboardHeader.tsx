
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
  
  return (
    <div 
      className="container mx-auto px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-background transition-colors duration-300"
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
