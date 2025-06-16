
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

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
  const { signOut, userProfile } = useAuth();
  const { userCompanies } = useCompanies();

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

  // Determinar se pode fechar o dialog
  const canClose = userProfile?.super_admin || userCompanies.length > 0;

  const handleOpenChange = (shouldOpen: boolean) => {
    if (!shouldOpen && !canClose) {
      // Não permitir fechar se o usuário não é super admin e não tem empresas
      console.log("[CompanySelectionDialog] Cannot close - user has no companies and is not super admin");
      return;
    }
    onOpenChange(shouldOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-3xl p-0 max-h-[90vh] h-auto overflow-hidden flex flex-col"
        // Desabilitar fechar com ESC se não pode fechar
        onEscapeKeyDown={(e) => {
          if (!canClose) {
            e.preventDefault();
          }
        }}
        // Desabilitar fechar clicando fora se não pode fechar
        onPointerDownOutside={(e) => {
          if (!canClose) {
            e.preventDefault();
          }
        }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-t-lg flex-1 overflow-auto">
          <div className="p-12 md:p-10">
            <DialogHeader className="mb-6">
              <div className="text-center">
                <DialogTitle className="text-xl font-semibold">
                  Configuração da Empresa
                </DialogTitle>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  {canClose 
                    ? "Escolha entre criar uma nova empresa ou vincular-se a uma existente"
                    : "É necessário criar ou vincular-se a uma empresa para continuar"
                  }
                </p>
              </div>
            </DialogHeader>

            <OnboardingProvider>
              <CompanyStep 
                onNext={handleCompanyCreated}
                onBack={() => canClose && onOpenChange(false)} 
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
