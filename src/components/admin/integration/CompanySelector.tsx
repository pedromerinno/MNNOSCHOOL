
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";

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
  return (
    <div className="w-full md:w-72">
      <Select 
        value={selectedCompany?.id} 
        onValueChange={onCompanyChange}
        disabled={disabled || companies.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {companies.map(company => (
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
