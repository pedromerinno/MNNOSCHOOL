
import { useState, useEffect } from "react";
import { CompanyInfoDisplay } from "@/components/company/CompanyInfoDisplay";

export const DashboardHeader = () => {
  // Estado local para cor com inicialização
  const [headerBgColor, setHeaderBgColor] = useState<string>("transparent");
  
  // Renderizar o header com base na empresa selecionada
  const renderCompanyHeader = (company: any) => {
    // Atualizar cor baseada na empresa
    useEffect(() => {
      if (company?.cor_principal) {
        console.log(`DashboardHeader: Atualizando cor para ${company.cor_principal}`);
        setHeaderBgColor(`${company.cor_principal}05`); // 5% de opacidade
      }
    }, [company]);
    
    return (
      <div className="flex items-center justify-end">
        {/* Empty container for potential future elements */}
      </div>
    );
  };
  
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
      <CompanyInfoDisplay 
        renderInfo={renderCompanyHeader}
        loadingFallback={<div className="flex items-center justify-end" />}
        emptyFallback={<div className="flex items-center justify-end" />}
      />
    </div>
  );
};
