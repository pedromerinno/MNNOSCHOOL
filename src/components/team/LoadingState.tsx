
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  slowLoading?: boolean;
}

export const LoadingState = ({ slowLoading = false }: LoadingStateProps) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Carregando membros da equipe...
      </p>
      
      {slowLoading && (
        <div className="mt-6 max-w-md text-center">
          <div className="flex items-center justify-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
            <AlertCircle size={16} />
            <p className="text-sm font-medium">O carregamento está demorando mais que o esperado</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Isso pode acontecer quando há muitos membros na equipe ou quando a conexão está lenta.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
};
