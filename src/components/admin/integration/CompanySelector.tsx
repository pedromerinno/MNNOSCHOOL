
import React, { useEffect, useState, memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [retryCount, setRetryCount] = useState(0);

  // Verificar se companies é um array e não está vazio
  const hasCompanies = Array.isArray(companies) && companies.length > 0;

  // Manipular exibição de erro
  useEffect(() => {
    if (!hasCompanies && !disabled) {
      setError("Não foi possível carregar a lista de empresas");
    } else {
      setError(null);
    }
  }, [companies, disabled, hasCompanies]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Despachar evento que será capturado pelos componentes que precisam recarregar
    window.dispatchEvent(new CustomEvent('force-reload-companies'));
    setError("Tentando novamente...");
    
    // Resetar erro após 3 segundos
    setTimeout(() => {
      if (!hasCompanies) {
        setError("Não foi possível carregar a lista de empresas");
      } else {
        setError(null);
      }
    }, 3000);
  };

  return (
    <div className="w-full md:w-80">
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
        disabled={disabled || !hasCompanies}
      >
        <SelectTrigger className="w-full h-12 text-base">
          <SelectValue placeholder="Selecione uma empresa">
            {selectedCompany && (
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2 rounded-full">
                  {selectedCompany.logo ? (
                    <AvatarImage 
                      src={selectedCompany.logo} 
                      alt={selectedCompany.nome}
                      className="rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null;
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs rounded-full">
                    {selectedCompany.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base">{selectedCompany.nome}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 w-full min-w-[320px]">
          {hasCompanies && companies.map(company => (
            <SelectItem key={company.id} value={company.id} className="py-3">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2 rounded-full">
                  {company.logo ? (
                    <AvatarImage 
                      src={company.logo} 
                      alt={company.nome}
                      className="rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null;
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs rounded-full">
                    {company.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base">{company.nome}</span>
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
