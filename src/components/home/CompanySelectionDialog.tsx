
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";

interface CompanySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
  onCompanyCreated: () => void;
  userId?: string;
  forceGetUserCompanies?: (userId: string) => Promise<any>;
}

export const CompanySelectionDialog: React.FC<CompanySelectionDialogProps> = ({
  open,
  onOpenChange,
  onCompanyTypeSelect,
  onCompanyCreated,
  userId,
  forceGetUserCompanies
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[90vh] h-auto overflow-hidden flex flex-col">
        <div className="bg-white dark:bg-gray-900 rounded-t-lg flex-1 overflow-auto">
          <div className="p-12 md:p-10">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold text-center">
                Configuração da Empresa
              </DialogTitle>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Escolha entre criar uma nova empresa ou vincular-se a uma existente
              </p>
            </DialogHeader>

            <OnboardingProvider>
              <CompanyStep 
                onNext={() => {
                  console.log("[CompanySelectionDialog] CompanyStep onNext called");
                  onOpenChange(false);
                  if (userId && forceGetUserCompanies) {
                    forceGetUserCompanies(userId);
                  }
                  onCompanyCreated();
                }} 
                onBack={() => onOpenChange(false)} 
                onCompanyTypeSelect={onCompanyTypeSelect} 
                onCompanyCreated={onCompanyCreated} 
                showBackButton={false} 
                hideHeader={true}
              />
            </OnboardingProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
