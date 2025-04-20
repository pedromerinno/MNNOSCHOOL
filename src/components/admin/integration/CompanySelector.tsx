
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

interface CompanySelectorProps {
  companies: Company[];
  selectedCompany: Company | null;
  onCompanyChange: (companyId: string) => void;
  disabled?: boolean;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedCompany,
  onCompanyChange,
  disabled = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Handle fetch error display
  useEffect(() => {
    if (!companies || (Array.isArray(companies) && companies.length === 0) && !disabled) {
      setError("Não foi possível carregar a lista de empresas");
    } else {
      setError(null);
    }
  }, [companies, disabled]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Dispatch an event that will be caught by components that need to reload
    window.dispatchEvent(new CustomEvent('force-reload-companies'));
    setError("Tentando novamente...");
    
    // Reset error after 3 seconds
    setTimeout(() => {
      if (!companies || (Array.isArray(companies) && companies.length === 0)) {
        setError("Não foi possível carregar a lista de empresas");
      } else {
        setError(null);
      }
    }, 3000);
  };

  return (
    <div className="w-full md:w-72">
      {error ? (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de conexão</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry} 
                className="mt-2 w-full"
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      
      <Select 
        value={selectedCompany?.id} 
        onValueChange={onCompanyChange}
        disabled={disabled || !companies || (Array.isArray(companies) && companies.length === 0)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(companies) && companies.map(company => (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex items-center">
                {company.logo && (
                  <img
                    src={company.logo}
                    alt={company.nome}
                    className="h-4 w-4 mr-2 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                      target.onerror = null;
                    }}
                  />
                )}
                {company.nome}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
