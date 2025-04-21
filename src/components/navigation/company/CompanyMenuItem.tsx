
import { memo } from 'react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Company } from '@/types/company';

interface CompanyMenuItemProps {
  company: Company;
  isSelected: boolean;
  onSelect: (company: Company) => void;
}

export const CompanyMenuItem = memo(({ company, isSelected, onSelect }: CompanyMenuItemProps) => {
  return (
    <DropdownMenuItem 
      key={company.id} 
      onClick={() => onSelect(company)}
      className={`cursor-pointer ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
    >
      <div className="flex items-center">
        {company.logo && (
          <img
            src={company.logo}
            alt={company.nome}
            className="h-4 w-4 mr-2 object-contain rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.onerror = null;
            }}
          />
        )}
        <span>{company.nome}</span>
      </div>
    </DropdownMenuItem>
  );
});

CompanyMenuItem.displayName = 'CompanyMenuItem';
