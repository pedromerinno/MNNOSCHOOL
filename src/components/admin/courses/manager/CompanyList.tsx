
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Company } from '@/types/company';
import { getInitials } from '@/utils/stringUtils';

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
  // Garantir que companies é um array
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
        <div key={company.id} className="flex items-center space-x-3 py-2">
          <Checkbox 
            id={`company-${company.id}`}
            checked={selectedCompanies.includes(company.id)}
            onCheckedChange={() => onToggleCompany(company.id)}
          />
          <div className="flex items-center space-x-2">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.nome}
                className="h-5 w-5 rounded object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const initialsDiv = document.createElement('div');
                    initialsDiv.className = "h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium";
                    initialsDiv.textContent = getInitials(company.nome);
                    parent.insertBefore(initialsDiv, target);
                  }
                }}
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                {getInitials(company.nome)}
              </div>
            )}
            <label 
              htmlFor={`company-${company.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {company.nome}
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};
