
import React, { createContext, useContext, useState, useEffect } from "react";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/useCompanies";

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    selectedCompany: hookSelectedCompany, 
    selectCompany, // This is the method we need to use
    isLoading 
  } = useCompanies();

  // Usar estado do hook useCompanies
  const [companyState, setCompanyState] = useState<Company | null>(hookSelectedCompany);

  // Sincronizar com o estado do hook
  useEffect(() => {
    if (hookSelectedCompany) {
      setCompanyState(hookSelectedCompany);
      console.log("CompanyContext: Empresa atualizada:", hookSelectedCompany.nome);
    }
  }, [hookSelectedCompany]);

  // Função para atualizar a empresa selecionada
  const updateSelectedCompany = (company: Company | null) => {
    if (company) {
      // Use the selectCompany method from useCompanies
      const { user } = useCompanies();
      if (user?.id) {
        selectCompany(user.id, company);
      }
    }
    setCompanyState(company);
  };

  // Ouvir eventos de mudança de empresa
  useEffect(() => {
    const handleCompanyChange = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log("CompanyContext: Evento de mudança de empresa detectado:", company?.nome);
      setCompanyState(company);
    };

    window.addEventListener('company-selected', handleCompanyChange as EventListener);
    window.addEventListener('company-updated', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('company-selected', handleCompanyChange as EventListener);
      window.removeEventListener('company-updated', handleCompanyChange as EventListener);
    };
  }, []);

  return (
    <CompanyContext.Provider 
      value={{ 
        selectedCompany: companyState, 
        setSelectedCompany: updateSelectedCompany,
        isLoading 
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompanyContext = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanyContext deve ser usado dentro de um CompanyProvider');
  }
  return context;
};
