
import React, { useState, useEffect, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetrying, setAutoRetrying] = useState(false);
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

  // Show timeout message after 3 seconds of loading (mais rápido)
  useEffect(() => {
    if (!timeout && !error) {
      const timeoutId = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 3000); // Reduzido de 5s para 3s
      
      return () => clearTimeout(timeoutId);
    }
  }, [timeout, error]);

  // Auto-retry logic mais inteligente
  const handleRetry = useCallback(() => {
    if (onRetry) {
      setRetryCount(prev => prev + 1);
      setAutoRetrying(true);
      onRetry();
      
      // Reset auto-retry state after a delay
      setTimeout(() => {
        setAutoRetrying(false);
      }, 2000);
    }
  }, [onRetry]);

  // Auto-retry apenas uma vez em erros de rede
  useEffect(() => {
    if (error && (
      error.includes("Failed to fetch") ||
      error.includes("Timeout") ||
      error.includes("net::ERR_")
    ) && retryCount === 0 && !autoRetrying) {
      const timeoutId = setTimeout(() => {
        console.log(`Auto-retrying after network error`);
        handleRetry();
      }, 2000); // Retry mais rápido
      
      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount, autoRetrying, handleRetry]);

  if (error) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-gray-700 font-medium">Erro ao carregar colaboradores</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          {onRetry && (
            <div className="mt-4 space-y-2">
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                disabled={autoRetrying}
                className="w-full"
              >
                {autoRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tentando novamente...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente {retryCount > 0 ? `(${retryCount})` : ''}
                  </>
                )}
              </Button>
              {retryCount > 2 && (
                <p className="text-xs text-amber-600">
                  Se o problema persistir, verifique sua conexão com a internet
                </p>
              )}
            </div>
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
            <p className="text-xs text-gray-500">
              Isso pode indicar uma conexão lenta ou muitos dados para processar.
            </p>
            {onRetry && (
              <Button 
                onClick={handleRetry} 
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
