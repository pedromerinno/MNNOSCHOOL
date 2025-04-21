
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { useCompanies } from "@/hooks/useCompanies";

export const NoCompaniesAvailable = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { forceGetUserCompanies } = useCompanies();
  
  const handleCompanyCreated = () => {
    setShowDialog(false);
  };
  
  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[NoCompaniesAvailable] Company type selected:", isExisting ? "existing" : "new");
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl p-0 h-[90vh] overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Configuração de Empresa</DialogTitle>
          <div className="bg-white rounded-t-lg flex-1 overflow-auto">
            <div className="p-6 md:p-8">
              <OnboardingProvider>
                <CompanyStep 
                  onNext={handleCompanyCreated}
                  onBack={() => setShowDialog(false)}
                  onCompanyTypeSelect={handleCompanyTypeSelect}
                  onCompanyCreated={handleCompanyCreated}
                />
              </OnboardingProvider>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
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
            Configurar acesso
          </Button>
        </div>
      </div>
    </>
  );
};
