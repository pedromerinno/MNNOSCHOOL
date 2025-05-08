
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
      
      <div className="w-full md:w-80">
        <Select 
          value={selectedCompany?.id} 
          onValueChange={onCompanyChange}
          disabled={isDisabled}
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
            {companies.map(company => (
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
    </div>
  );
};
