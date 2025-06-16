
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
  const [showSlowMessage, setShowSlowMessage] = useState(false);
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

  // Show slow message after 8 seconds (more patient)
  useEffect(() => {
    if (!timeout && !error) {
      const timeoutId = setTimeout(() => {
        setShowSlowMessage(true);
      }, 8000);
      
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
        {showSlowMessage ? (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-amber-600">
              Carregamento mais lento que o esperado...
            </p>
            <p className="text-xs text-gray-500">
              Aguarde mais alguns segundos.
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
            Buscando dados da empresa...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
