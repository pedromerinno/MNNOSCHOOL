
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SubmitButtonProps {
  isSaving: boolean;
  color?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  isSaving,
  color
}) => {
  return (
    <Button 
      type="submit" 
      disabled={isSaving}
      className="relative overflow-hidden transition-all duration-200"
      style={color ? { backgroundColor: color } : undefined}
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

      {/* Add hover effect with span */}
      <span className="absolute inset-0 h-full w-full bg-white/10 opacity-0 transition-opacity hover:opacity-100" />
    </Button>
  );
};
