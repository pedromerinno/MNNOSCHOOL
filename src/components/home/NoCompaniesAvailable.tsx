
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelectionDialog } from "./CompanySelectionDialog";

interface NoCompaniesAvailableProps {
  initialDialogState?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  onCompanyTypeSelect?: (isExisting: boolean) => void;
  onCompanyCreated?: () => void;
  userId?: string;
  forceGetUserCompanies?: (userId: string) => Promise<any>;
}

export const NoCompaniesAvailable = ({
  initialDialogState,
  onDialogOpenChange,
  onCompanyTypeSelect,
  onCompanyCreated,
  userId,
  forceGetUserCompanies
}: NoCompaniesAvailableProps = {}) => {
  // Local state for dialog control if not provided via props
  const [internalShowDialog, setInternalShowDialog] = useState(false);
  
  // Use external state control if provided, otherwise use internal state
  const showDialog = initialDialogState !== undefined ? initialDialogState : internalShowDialog;
  const setShowDialog = onDialogOpenChange || setInternalShowDialog;
  
  const {
    forceGetUserCompanies: defaultForceGetUserCompanies,
    user
  } = useCompanies();
  
  // Use props handlers if provided, otherwise use defaults
  const handleCompanyCreated = onCompanyCreated || (() => {
    setShowDialog(false);
    if (userId || user?.id) {
      const id = userId || user?.id;
      if (id) {
        (forceGetUserCompanies || defaultForceGetUserCompanies)(id);
      }
    }
  });
  
  const handleCompanyTypeSelect = onCompanyTypeSelect || ((isExisting: boolean) => {
    console.log("[NoCompaniesAvailable] Company type selected:", isExisting ? "existing" : "new");
  });

  // Set initial dialog state based on props
  useEffect(() => {
    if (initialDialogState !== undefined) {
      setInternalShowDialog(initialDialogState);
    }
  }, [initialDialogState]);

  return (
    <>
      <CompanySelectionDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        onCompanyTypeSelect={handleCompanyTypeSelect} 
        onCompanyCreated={handleCompanyCreated} 
        userId={userId || user?.id} 
        forceGetUserCompanies={forceGetUserCompanies || defaultForceGetUserCompanies} 
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
