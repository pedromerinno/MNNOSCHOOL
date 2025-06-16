
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
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
  const [loadingDots, setLoadingDots] = useState('');
  
  // Animação dos pontinhos de loading
  useEffect(() => {
    if (!error) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [error]);

  // Show timeout message after 3 seconds
  useEffect(() => {
    if (!timeout && !error) {
      const timeoutId = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 3000);
      
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
              <RefreshCw className="h-4 w-4 mr-2" />
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
        <p className="mt-2 text-gray-700 font-medium">
          Carregando colaboradores{loadingDots}
        </p>
        {showTimeoutMessage ? (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-amber-600">
              O carregamento está demorando mais que o esperado.
            </p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            Aguarde enquanto buscamos os dados...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
