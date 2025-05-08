
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface IntegrationHeaderProps {
  companies: Company[];
  selectedCompany: Company | null;
  onCompanyChange: (companyId: string) => void;
  isDisabled: boolean;
}

export const IntegrationHeader: React.FC<IntegrationHeaderProps> = ({
  companies,
  selectedCompany,
  onCompanyChange,
  isDisabled
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-1">Gerenciar Conteúdo de Integração</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Edite as informações de integração exibidas para cada empresa
        </p>
      </div>
      
      <div className="w-full md:w-72">
        <Select 
          value={selectedCompany?.id} 
          onValueChange={onCompanyChange}
          disabled={isDisabled}
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
                          target.src = "/placeholder.svg";
                          target.onerror = null;
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {selectedCompany.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedCompany.nome}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center">
                  <Avatar className="h-5 w-5 mr-2">
                    {company.logo ? (
                      <AvatarImage 
                        src={company.logo} 
                        alt={company.nome} 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                          target.onerror = null;
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {company.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {company.nome}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
