
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { toast } from 'sonner';

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
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedCompany?.id || null);
  
  // Effect to handle companies loaded after component mount
  useEffect(() => {
    if (!selectedCompany && companies.length > 0 && !isDisabled) {
      console.log('IntegrationHeader: No company selected, auto-selecting first company');
      onCompanyChange(companies[0].id);
      toast.info(`Company ${companies[0].nome} automatically selected`);
      setLocalSelectedId(companies[0].id);
    }
  }, [selectedCompany, companies, isDisabled, onCompanyChange]);
  
  // Effect to sync local state with prop updates
  useEffect(() => {
    if (selectedCompany?.id && localSelectedId !== selectedCompany.id) {
      setLocalSelectedId(selectedCompany.id);
    }
  }, [selectedCompany, localSelectedId]);
  
  const handleCompanySelect = (companyId: string) => {
    setLocalSelectedId(companyId);
    onCompanyChange(companyId);
  };

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
          value={localSelectedId || undefined} 
          onValueChange={handleCompanySelect}
          disabled={isDisabled || companies.length === 0}
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
