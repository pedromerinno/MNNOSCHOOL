
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
  
  // Show timeout message after 5 seconds of loading
  useEffect(() => {
    if (!timeout && !error) {
      const timeoutId = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [timeout, error]);

  // Auto-retry logic
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

  // Auto-retry on specific errors if retry count is low
  useEffect(() => {
    if (error && (
      error.includes("Failed to fetch") ||
      error.includes("storage/bucket-not-found") ||
      error.includes("net::ERR_")
    ) && retryCount < 3 && !autoRetrying) {
      const timeoutId = setTimeout(() => {
        console.log(`Auto-retrying after error (attempt ${retryCount + 1})`);
        handleRetry();
      }, 3000);
      
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
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="mt-4"
              disabled={autoRetrying}
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
