
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";

interface CompanySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const CompanySelectionDialog = ({ 
  open, 
  onOpenChange,
  onComplete
}: CompanySelectionDialogProps) => {
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();
  const [isLoading, setIsLoading] = useState(false);

  const handleCompanyCreated = async () => {
    setIsLoading(true);
    
    try {
      if (user?.id) {
        await forceGetUserCompanies(user.id);
      }
      onComplete();
    } catch (error) {
      console.error("Erro ao processar empresa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[CompanySelectionDialog] Tipo de empresa selecionado:", isExisting ? "existente" : "nova");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!isLoading) onOpenChange(value);
    }}>
      <DialogContent className="max-w-2xl p-0 h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Configuração de Empresa</DialogTitle>
          <DialogDescription>
            Vincule-se a uma empresa existente ou crie uma nova
          </DialogDescription>
        </DialogHeader>
        <div className="bg-white rounded-t-lg flex-1 overflow-auto">
          <div className="p-6">
            <OnboardingProvider>
              <CompanyStep 
                onNext={() => {
                  console.log("[CompanySelectionDialog] CompanyStep onNext chamado");
                  handleCompanyCreated();
                }}
                onBack={() => onOpenChange(false)}
                onCompanyTypeSelect={handleCompanyTypeSelect}
                onCompanyCreated={handleCompanyCreated}
              />
            </OnboardingProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
