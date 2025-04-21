
import { useCompanies } from "@/hooks/useCompanies";
import { useState, useEffect } from "react";

export const DashboardHeader = () => {
  const { selectedCompany, userCompanies } = useCompanies();
  
  // Estado local para cor com inicialização
  const [headerBgColor, setHeaderBgColor] = useState<string>("transparent");
  
  // Atualizar a cor quando a empresa selecionada mudar ou quando userCompanies mudar
  useEffect(() => {
    // Priorize a empresa selecionada
    if (selectedCompany?.cor_principal) {
      console.log(`DashboardHeader: Atualizando cor para ${selectedCompany.cor_principal}`);
      setHeaderBgColor(`${selectedCompany.cor_principal}05`); // 5% de opacidade
    } 
    // Se não houver empresa selecionada mas existirem empresas, use a primeira
    else if (userCompanies && userCompanies.length > 0 && userCompanies[0].cor_principal) {
      console.log(`DashboardHeader: Não há empresa selecionada, usando cor da primeira empresa: ${userCompanies[0].cor_principal}`);
      setHeaderBgColor(`${userCompanies[0].cor_principal}05`); // 5% de opacidade
    }
  }, [selectedCompany, userCompanies]);
  
  // Listen for company update events
  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail?.company;
      
      if (updatedCompany?.cor_principal) {
        console.log(`DashboardHeader: Company update event received, updating color to ${updatedCompany.cor_principal}`);
        setHeaderBgColor(`${updatedCompany.cor_principal}05`); // 5% de opacidade
      }
    };
    
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
    };
  }, []);
  
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
