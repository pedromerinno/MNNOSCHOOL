
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";

export const IntegrationLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { selectedCompany } = useCompanies();

  return (
    <div className="min-h-screen bg-background dark:bg-[#191919]">
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
              Integração
            </h1>
            {selectedCompany && (
              <CompanyThemedBadge 
                variant="beta"
              >
                {selectedCompany.nome}
              </CompanyThemedBadge>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#191919] rounded-xl shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
