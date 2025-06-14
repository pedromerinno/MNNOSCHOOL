
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    onOpenChange(false);
  };

  const handleCompanyCreated = () => {
    console.log("[CompanySelectionDialog] Company created, closing dialog");
    onOpenChange(false);
    if (userId && forceGetUserCompanies) {
      forceGetUserCompanies(userId);
    }
    onCompanyCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[90vh] h-auto overflow-hidden flex flex-col">
        <div className="bg-white dark:bg-gray-900 rounded-t-lg flex-1 overflow-auto">
          <div className="p-12 md:p-10">
            <DialogHeader className="mb-6">
              <div className="text-center">
                <DialogTitle className="text-xl font-semibold">
                  Configuração da Empresa
                </DialogTitle>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Escolha entre criar uma nova empresa ou vincular-se a uma existente
                </p>
              </div>
            </DialogHeader>

            <OnboardingProvider>
              <CompanyStep 
                onNext={handleCompanyCreated}
                onBack={() => onOpenChange(false)} 
                onCompanyTypeSelect={onCompanyTypeSelect} 
                onCompanyCreated={handleCompanyCreated} 
                showBackButton={false} 
                hideHeader={true}
              />
            </OnboardingProvider>
          </div>
          
          {/* Botão de logout na parte inferior */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-gray-600 hover:text-red-500 flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Trocar a conta de usuário
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
