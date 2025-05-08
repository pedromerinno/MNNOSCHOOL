
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface LoadingStateProps {
  slowLoading?: boolean;
}

export const LoadingState = ({ slowLoading = false }: LoadingStateProps) => {
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  
  useEffect(() => {
    // Se o carregamento estiver demorando muito, mostre mensagem adicional após 10 segundos
    let timeout: NodeJS.Timeout;
    if (slowLoading) {
      timeout = setTimeout(() => {
        setShowExtendedMessage(true);
      }, 10000);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [slowLoading]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="max-w-md text-center flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
          Carregando membros da equipe...
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Isso pode levar alguns instantes
        </p>
        
        {slowLoading && (
          <div className="mt-4 w-full">
            <div className="flex items-center justify-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
              <AlertCircle size={16} />
              <p className="text-sm font-medium">O carregamento está demorando mais que o esperado</p>
            </div>
            
            {showExtendedMessage ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Estamos tendo dificuldade para carregar os dados. Isso pode acontecer quando:
                </p>
                <ul className="text-sm text-left text-gray-500 dark:text-gray-400 space-y-1 list-disc pl-5">
                  <li>Há muitos membros na equipe para carregar</li>
                  <li>A conexão com o servidor está lenta</li>
                  <li>Houve um problema temporário no servidor</li>
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Isso pode acontecer quando há muitos membros na equipe ou quando a conexão está lenta.
              </p>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              className="mt-4" 
              onClick={handleRefresh}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
