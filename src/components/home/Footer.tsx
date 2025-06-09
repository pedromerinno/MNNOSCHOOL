
import { useCompanies } from "@/hooks/useCompanies";
import { useState, useEffect } from "react";

export const Footer = () => {
  const { selectedCompany } = useCompanies();
  
  // Estado local para o nome da empresa
  const [companyName, setCompanyName] = useState<string>("merinno");
  
  // Atualizar quando a seleção mudar
  useEffect(() => {
    if (selectedCompany?.nome) {
      console.log(`Footer: Atualizando nome para "${selectedCompany.nome}"`);
      setCompanyName(selectedCompany.nome);
    }
  }, [selectedCompany]);

  // Adicionar listener para mudanças no nome da empresa
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      const updatedCompany = event.detail.company;
      if (updatedCompany?.nome && selectedCompany?.id === updatedCompany.id) {
        console.log(`Footer: Atualizando nome via evento para "${updatedCompany.nome}"`);
        setCompanyName(updatedCompany.nome);
      }
    };

    const handleCompanyNameChange = (event: CustomEvent) => {
      const { companyId, newName } = event.detail;
      if (selectedCompany?.id === companyId) {
        console.log(`Footer: Atualizando nome via mudança específica para "${newName}"`);
        setCompanyName(newName);
      }
    };

    window.addEventListener('company-updated', handleCompanyUpdate as EventListener);
    window.addEventListener('company-name-changed', handleCompanyNameChange as EventListener);

    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-name-changed', handleCompanyNameChange as EventListener);
    };
  }, [selectedCompany?.id]);

  return (
    <footer className="py-6 text-center text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <p className="text-gray-400 transition-colors duration-300">{companyName}</p>
      </div>
    </footer>
  );
};
