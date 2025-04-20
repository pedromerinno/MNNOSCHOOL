
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useState, useEffect } from "react";

export const Footer = () => {
  const { selectedCompany } = useCompanies();
  const { getInitialSelectedCompany } = useCompanyCache();
  
  // Inicializar com valor do cache
  const [companyName, setCompanyName] = useState<string>(() => {
    const cachedCompany = getInitialSelectedCompany();
    return cachedCompany?.nome || "merinno";
  });
  
  // Atualizar quando a seleção mudar
  useEffect(() => {
    if (selectedCompany?.nome) {
      setCompanyName(selectedCompany.nome);
    }
  }, [selectedCompany]);

  return (
    <footer className="py-6 text-center text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <p className="text-gray-400 transition-colors duration-300">{companyName}</p>
      </div>
    </footer>
  );
};
