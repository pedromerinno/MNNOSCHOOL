
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

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
      <DialogContent className="max-w-2xl p-0 max-h-[90vh] h-auto overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Configuração de Empresa</DialogTitle>
        <div className="bg-white rounded-t-lg flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            <OnboardingProvider>
              <CompanyStep 
                onNext={() => {
                  console.log("[Index] CompanyStep onNext called");
                  onOpenChange(false);
                  if (userId && forceGetUserCompanies) {
                    forceGetUserCompanies(userId);
                  }
                  if (onNext) onNext();
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
