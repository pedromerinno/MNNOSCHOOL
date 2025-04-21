
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";

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
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                {company.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
