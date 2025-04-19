
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CompanyManagerActionsProps {
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export const CompanyManagerActions: React.FC<CompanyManagerActionsProps> = ({
  onClose,
  onSave,
  isSaving
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onClose}
        disabled={isSaving}
      >
        Cancelar
      </Button>
      <Button 
        onClick={onSave} 
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Alterações'
        )}
      </Button>
    </div>
  );
};
