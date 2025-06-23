
import React, { useEffect, useState, memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/stringUtils";

interface CompanySelectorProps {
  companies: Company[];
  selectedCompany: Company | null;
  onCompanyChange: (companyId: string) => void;
  disabled?: boolean;
}

// Usar memo para evitar renderizações desnecessárias
export const CompanySelector: React.FC<CompanySelectorProps> = memo(({
  companies,
  selectedCompany,
  onCompanyChange,
  disabled = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Verificar se companies é um array e não está vazio
  const hasCompanies = Array.isArray(companies) && companies.length > 0;

  // Melhor manipulação de erro
  useEffect(() => {
    if (!hasCompanies && !disabled && !isRetrying) {
      setError("Lista de empresas indisponível");
    } else if (hasCompanies) {
      setError(null);
    }
  }, [companies, disabled, hasCompanies, isRetrying]);

  const handleRetry = () => {
    setIsRetrying(true);
    setError("Recarregando...");
    
    // Despachar evento que será capturado pelos componentes que precisam recarregar
    window.dispatchEvent(new CustomEvent('force-reload-companies'));
    
    // Reset após 2 segundos
    setTimeout(() => {
      setIsRetrying(false);
      if (!hasCompanies) {
        setError("Lista de empresas indisponível");
      }
    }, 2000);
  };

  return (
    <div className="w-full md:w-72">
      {error && !hasCompanies ? (
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
                disabled={isRetrying}
              >
                {isRetrying ? "Tentando..." : "Tentar novamente"}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      
      <Select 
        value={selectedCompany?.id || ''} 
        onValueChange={onCompanyChange}
        disabled={disabled || !hasCompanies || isRetrying}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma empresa">
            {selectedCompany && (
              <div className="flex items-center">
                <Avatar className="h-5 w-5 mr-2">
                  {selectedCompany.logo ? (
                    <AvatarImage 
                      src={selectedCompany.logo} 
                      alt={selectedCompany.nome}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getInitials(selectedCompany.nome)}
                  </AvatarFallback>
                </Avatar>
                {selectedCompany.nome}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {hasCompanies && companies.map(company => (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex items-center">
                <Avatar className="h-5 w-5 mr-2">
                  {company.logo ? (
                    <AvatarImage 
                      src={company.logo} 
                      alt={company.nome}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getInitials(company.nome)}
                  </AvatarFallback>
                </Avatar>
                {company.nome}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

// Definir displayName para melhorar depuração
CompanySelector.displayName = 'CompanySelector';
