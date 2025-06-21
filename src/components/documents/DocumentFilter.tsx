
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Shield, ScrollText, Briefcase, Archive, Book, Clipboard, GraduationCap } from "lucide-react";

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
  const personalCategories = [
    { value: 'all', label: 'Todos', icon: FileText },
    { value: 'confidentiality_agreement', label: 'Confidencialidade', icon: Shield },
    { value: 'company_policy', label: 'Políticas', icon: ScrollText },
    { value: 'employment_contract', label: 'Contratos', icon: Briefcase },
    { value: 'other', label: 'Outros', icon: Archive }
  ];

  const companyCategories = [
    { value: 'all', label: 'Todos', icon: FileText },
    { value: 'confidentiality_agreement', label: 'Confidencialidade', icon: Shield },
    { value: 'company_policy', label: 'Políticas', icon: ScrollText },
    { value: 'employment_contract', label: 'Contratos', icon: Briefcase },
    { value: 'company_manual', label: 'Manuais', icon: Book },
    { value: 'procedures', label: 'Procedimentos', icon: Clipboard },
    { value: 'training_materials', label: 'Treinamentos', icon: GraduationCap },
    { value: 'other', label: 'Outros', icon: Archive }
  ];

  const categories = documentType === 'personal' ? personalCategories : companyCategories;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Filtrar por categoria</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = selectedCategory === category.value;
          
          return (
            <Button
              key={category.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.value)}
              className="flex items-center gap-2"
              style={isActive ? {
                backgroundColor: companyColor,
                borderColor: companyColor,
                color: 'white'
              } : {
                borderColor: `${companyColor}40`,
                color: companyColor
              }}
            >
              <IconComponent className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
