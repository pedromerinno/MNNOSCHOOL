
import React from 'react';
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Company } from "@/types/company";

interface CompanyHeaderProps {
  company: Company | null;
  companyColor: string;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ 
  company,
  companyColor
}) => {
  if (!company) return null;

  return (
    <div className="p-10">
      <div className="flex items-center mb-8">
        <CompanyThemedBadge 
          variant="beta"
          style={{
            backgroundColor: `${companyColor}20`,
            color: companyColor,
            borderColor: `${companyColor}40`
          }}
          className="mr-4"
        >
          {company.nome}
        </CompanyThemedBadge>
      </div>
    </div>
  );
};
