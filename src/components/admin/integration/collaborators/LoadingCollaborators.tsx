
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingCollaboratorsProps {
  timeout?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const LoadingCollaborators: React.FC<LoadingCollaboratorsProps> = ({ 
  timeout = false,
  error = null,
  onRetry
}) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(timeout);
  
  // Show timeout message after 5 seconds of loading
  useEffect(() => {
    if (!timeout && !error) {
      const timeoutId = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [timeout, error]);

  if (error) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-gray-700 font-medium">Erro ao carregar colaboradores</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-gray-700 font-medium">Carregando colaboradores...</p>
        {showTimeoutMessage ? (
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
