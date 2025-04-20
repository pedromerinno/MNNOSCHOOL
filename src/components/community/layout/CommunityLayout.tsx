
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";

export const CommunityLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { selectedCompany } = useCompanies();
  const [currentCompany, setCurrentCompany] = useState(selectedCompany);
  
  // Update when selectedCompany changes
  useEffect(() => {
    if (selectedCompany?.id !== currentCompany?.id) {
      console.log("CommunityLayout: Company changed to", selectedCompany?.nome);
      setCurrentCompany(selectedCompany);
    }
  }, [selectedCompany, currentCompany?.id]);
  
  // Listen for company change events
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const company = event.detail?.company;
      if (company) {
        console.log(`CommunityLayout: Company selection event received: ${company.nome}`);
        setCurrentCompany(company);
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <div className="flex items-center mb-12 gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold dark:text-white">
              Comunidade
            </h1>
            {currentCompany && (
              <CompanyThemedBadge 
                variant="beta"
              >
                {currentCompany.nome}
              </CompanyThemedBadge>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
