
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Company } from '@/types/company';

interface CompanyListProps {
  companies: Company[];
  selectedCompanies: string[];
  onToggleCompany: (companyId: string) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  selectedCompanies,
  onToggleCompany
}) => {
  // Make sure companies is an array
  const companiesList = Array.isArray(companies) ? companies : [];
  
  if (companiesList.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Nenhuma empresa encontrada
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-2 border rounded-md p-4">
      {companiesList.map(company => (
        <div key={company.id} className="flex items-center space-x-2 py-2">
          <Checkbox 
            id={`company-${company.id}`}
            checked={selectedCompanies.includes(company.id)}
            onCheckedChange={() => onToggleCompany(company.id)}
          />
          <label 
            htmlFor={`company-${company.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {company.nome}
          </label>
        </div>
      ))}
    </div>
  );
};
