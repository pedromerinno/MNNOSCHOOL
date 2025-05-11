
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { toast } from "sonner";

interface CompanyCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
  onCompanyCreated: () => void;
  userId?: string;
  onNext?: () => void;
  forceGetUserCompanies?: (userId: string) => Promise<any>;
}

export const CompanyCreationDialog = ({
  open, 
  onOpenChange,
  onCompanyTypeSelect,
  onCompanyCreated,
  userId,
  onNext,
  forceGetUserCompanies
}: CompanyCreationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-lg rounded-xl">
        <div className="bg-background flex-1 overflow-auto">
          <DialogHeader className="p-6 border-b border-border/40">
            <DialogTitle className="text-lg font-medium text-center">
              Configuração da Empresa
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-5">
            <p className="text-sm text-center text-muted-foreground mb-6">
              Escolha entre criar uma nova empresa ou vincular-se a uma existente
            </p>
            
            <OnboardingProvider>
              <CompanyStep 
                onNext={() => {
                  console.log("[Index] CompanyStep onNext called");
                  onOpenChange(false);
                  if (userId && forceGetUserCompanies) {
                    forceGetUserCompanies(userId);
                  }
                  if (onNext) onNext();
                  toast("Empresa configurada com sucesso");
                }}
                onBack={() => onOpenChange(false)}
                onCompanyTypeSelect={onCompanyTypeSelect}
                onCompanyCreated={onCompanyCreated}
              />
            </OnboardingProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
