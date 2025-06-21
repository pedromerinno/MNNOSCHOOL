import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Shield, ScrollText, Briefcase, Archive, Book, Clipboard, GraduationCap, Filter } from "lucide-react";
interface DocumentFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  documentType: 'personal' | 'company';
  companyColor: string;
}
export const DocumentFilter: React.FC<DocumentFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  documentType,
  companyColor
}) => {
  const personalCategories = [{
    value: 'all',
    label: 'Todos',
    icon: FileText
  }, {
    value: 'confidentiality_agreement',
    label: 'Confidencialidade',
    icon: Shield
  }, {
    value: 'company_policy',
    label: 'Políticas',
    icon: ScrollText
  }, {
    value: 'employment_contract',
    label: 'Contratos',
    icon: Briefcase
  }, {
    value: 'other',
    label: 'Outros',
    icon: Archive
  }];
  const companyCategories = [{
    value: 'all',
    label: 'Todos',
    icon: FileText
  }, {
    value: 'confidentiality_agreement',
    label: 'Confidencialidade',
    icon: Shield
  }, {
    value: 'company_policy',
    label: 'Políticas',
    icon: ScrollText
  }, {
    value: 'employment_contract',
    label: 'Contratos',
    icon: Briefcase
  }, {
    value: 'company_manual',
    label: 'Manuais',
    icon: Book
  }, {
    value: 'procedures',
    label: 'Procedimentos',
    icon: Clipboard
  }, {
    value: 'training_materials',
    label: 'Treinamentos',
    icon: GraduationCap
  }, {
    value: 'other',
    label: 'Outros',
    icon: Archive
  }];
  const categories = documentType === 'personal' ? personalCategories : companyCategories;
  return <div className="space-y-6 my-[40px]">
      <div className="flex items-center gap-3">
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Filtrar por categoria
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {categories.map(category => {
        const IconComponent = category.icon;
        const isActive = selectedCategory === category.value;
        return <Button key={category.value} variant={isActive ? "default" : "outline"} size="sm" onClick={() => onCategoryChange(category.value)} className="flex items-center gap-2 px-4 py-2 h-10 transition-all duration-200 hover:shadow-sm" style={isActive ? {
          backgroundColor: companyColor,
          borderColor: companyColor,
          color: 'white'
        } : {
          borderColor: `${companyColor}40`,
          color: companyColor,
          backgroundColor: 'transparent'
        }}>
              <IconComponent className="h-4 w-4" />
              {category.label}
            </Button>;
      })}
      </div>
    </div>;
};