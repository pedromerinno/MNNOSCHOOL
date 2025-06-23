
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCompanies } from "@/hooks/useCompanies";
import { getInitials } from "@/utils/stringUtils";

interface InviteCompanySelectorProps {
  selectedCompany: Company | null;
  onCompanyChange: (companyId: string) => void;
  disabled?: boolean;
}

export const InviteCompanySelector: React.FC<InviteCompanySelectorProps> = ({
  selectedCompany,
  onCompanyChange,
  disabled = false
}) => {
  const { userCompanies, isLoading, error, forceGetUserCompanies, user } = useCompanies({ 
    skipLoadingInOnboarding: false 
  });

  const handleRetry = () => {
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
  };

  if (error) {
    return (
      <div className="mb-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            Erro ao carregar empresas
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              className="mt-2 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : "Tentar novamente"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Select 
      value={selectedCompany?.id || ''} 
      onValueChange={onCompanyChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Carregando empresas..." : "Selecione uma empresa"}>
          {selectedCompany && selectedCompany.nome && (
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
        {userCompanies.map(company => (
          <SelectItem key={company.id} value={company.id}>
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-2">
                {company.logo ? (
                  <AvatarImage 
                    src={company.logo} 
                    alt={company.nome || 'Empresa'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                <AvatarFallback className="text-xs">
                  {getInitials(company.nome || 'Empresa')}
                </AvatarFallback>
              </Avatar>
              {company.nome || 'Empresa sem nome'}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
