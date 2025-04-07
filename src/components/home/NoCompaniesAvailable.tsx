
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NoCompaniesAvailable = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Nenhuma empresa disponível
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso.
        </p>
        
        <div className="flex justify-center">
          <Button 
            variant="default" 
            className="bg-black hover:bg-black/80 text-white"
            onClick={() => window.location.href = "mailto:suporte@merinno.com"}
          >
            Solicitar acesso
          </Button>
        </div>
      </div>
    </div>
  );
};
