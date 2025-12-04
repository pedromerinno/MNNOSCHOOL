
import { Building, AlertCircle, BriefcaseBusiness } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
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

      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <EmptyState
          title="Nenhuma empresa disponível"
          description="Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso."
          icons={[Building, BriefcaseBusiness, AlertCircle]}
          action={{
            label: "Configurar Acesso",
            onClick: () => setShowDialog(true)
          }}
        />
      </div>
    </>
  );
};
