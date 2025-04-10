
import React from 'react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
  showCompanySelector: boolean;
  companySelected: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isSubmitting,
  isEditing,
  showCompanySelector,
  companySelected
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || (showCompanySelector && !companySelected)}
      >
        {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Curso' : 'Criar Curso'}
      </Button>
    </div>
  );
};
