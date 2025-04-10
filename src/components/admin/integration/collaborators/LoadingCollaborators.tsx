
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingCollaboratorsProps {
  timeout?: boolean;
}

export const LoadingCollaborators: React.FC<LoadingCollaboratorsProps> = ({ 
  timeout = false 
}) => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-gray-500">Carregando colaboradores...</p>
        {timeout ? (
          <p className="text-xs text-amber-600 mt-1">
            O carregamento está demorando mais que o esperado. 
            Verifique sua conexão ou tente novamente mais tarde.
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            Isso pode levar alguns instantes, aguarde...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
