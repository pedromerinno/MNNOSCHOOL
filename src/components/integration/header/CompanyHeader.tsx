
import React from 'react';
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
      </div>
    </div>
  );
};
