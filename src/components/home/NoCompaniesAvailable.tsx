
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelectionDialog } from "./CompanySelectionDialog";

export const NoCompaniesAvailable = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { forceGetUserCompanies, user } = useCompanies();

  const handleCompanyCreated = () => {
    setShowDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[NoCompaniesAvailable] Company type selected:", isExisting ? "existing" : "new");
  };

  return (
    <>
      <CompanySelectionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onCompanyTypeSelect={handleCompanyTypeSelect}
        onCompanyCreated={handleCompanyCreated}
        userId={user?.id}
        forceGetUserCompanies={forceGetUserCompanies}
      />

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
          
          <Button 
            variant="outline" 
            className="border-black hover:bg-black/5"
            onClick={() => setShowDialog(true)}
          >
            Configurar Acesso
          </Button>
        </div>
      </div>
    </>
  );
};
