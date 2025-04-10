
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SubmitButtonProps {
  isSaving: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ isSaving }) => {
  return (
    <Button 
      type="submit" 
      disabled={isSaving}
      className="relative overflow-hidden transition-all duration-200"
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </>
      )}
    </Button>
  );
};
