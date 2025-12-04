import React from 'react';
import { FileText, Shield, ScrollText, Briefcase, Archive, Book, Clipboard, GraduationCap } from "lucide-react";
import { SmartCombobox } from "@/components/ui/smart-combo-box";

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
    id: 'all',
    label: 'Todos',
    icon: <FileText className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'confidentiality_agreement',
    label: 'Confidencialidade',
    icon: <Shield className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'company_policy',
    label: 'Políticas',
    icon: <ScrollText className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'employment_contract',
    label: 'Contratos',
    icon: <Briefcase className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'other',
    label: 'Outros',
    icon: <Archive className="h-4 w-4" style={{ color: companyColor }} />
  }];
  
  const companyCategories = [{
    id: 'all',
    label: 'Todos',
    icon: <FileText className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'confidentiality_agreement',
    label: 'Confidencialidade',
    icon: <Shield className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'company_policy',
    label: 'Políticas',
    icon: <ScrollText className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'employment_contract',
    label: 'Contratos',
    icon: <Briefcase className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'company_manual',
    label: 'Manuais',
    icon: <Book className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'procedures',
    label: 'Procedimentos',
    icon: <Clipboard className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'training_materials',
    label: 'Treinamentos',
    icon: <GraduationCap className="h-4 w-4" style={{ color: companyColor }} />
  }, {
    id: 'other',
    label: 'Outros',
    icon: <Archive className="h-4 w-4" style={{ color: companyColor }} />
  }];
  
  const categories = documentType === 'personal' ? personalCategories : companyCategories;
  
  return (
    <SmartCombobox
      placeholder="Buscar categoria..."
      options={categories}
      value={selectedCategory}
      onValueChange={(value) => {
        if (typeof value === 'string') {
          onCategoryChange(value);
        } else if (value === null) {
          onCategoryChange('all');
        }
      }}
      clearable={true}
      multiple={false}
      emptyState="Nenhuma categoria encontrada"
      className="w-full sm:w-[280px]"
    />
  );
};