
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Carregando acessos...</p>
    </div>
  );
};
