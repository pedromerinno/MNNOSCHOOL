
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelectionDialog } from "./CompanySelectionDialog";

export const NoCompaniesAvailable = () => {
  const [showDialog, setShowDialog] = useState(false);
  const {
    forceGetUserCompanies,
    user
  } = useCompanies();

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
        <div className="max-w-sm w-full mx-auto bg-card border border-border rounded-lg p-6 shadow-sm animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-muted">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="text-xl font-medium text-center mb-3 text-foreground">
            Nenhuma empresa disponível
          </h1>
          
          <p className="text-sm text-center text-muted-foreground mb-6">
            Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso.
          </p>
          
          <div className="flex justify-center my-[10px]">
            <Button variant="outline" size="sm" className="hover:bg-accent transition-colors" onClick={() => setShowDialog(true)}>
              Configurar Acesso
            </Button>
          </div>
          
          
        </div>
      </div>
    </>
  );
};
