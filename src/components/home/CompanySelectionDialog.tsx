
import React, { useMemo, useState, useCallback } from "react";
import { UserCog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { CompanyTypeSelection } from "./CompanyTypeSelection";
import NewCompanyForm from "@/components/onboarding/steps/company/NewCompanyForm";
import ExistingCompanyForm from "@/components/onboarding/steps/company/ExistingCompanyForm";

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
  const [selectedCompanyType, setSelectedCompanyType] = useState<'new' | 'existing' | null>(null);
  const [activeSection, setActiveSection] = useState<string>('type');
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  const handleLogout = () => {
    signOut();
    onOpenChange(false);
  };

  const handleCompanyCreated = useCallback(() => {
    console.log("[CompanySelectionDialog] Company created, closing dialog");
    onOpenChange(false);
    if (userId && forceGetUserCompanies) {
      forceGetUserCompanies(userId);
    }
    onCompanyCreated();
    // Reset state
    setSelectedCompanyType(null);
    setActiveSection('type');
  }, [userId, forceGetUserCompanies, onCompanyCreated, onOpenChange]);

  const handleTypeSelect = useCallback((type: 'new' | 'existing') => {
    setSelectedCompanyType(type);
    if (onCompanyTypeSelect) {
      onCompanyTypeSelect(type === 'existing');
    }
    // Trocar automaticamente para informações quando qualquer tipo for selecionado
    setActiveSection('info');
  }, [onCompanyTypeSelect]);

  // Se o tipo for desmarcado e estiver na seção de informações, voltar para tipo
  React.useEffect(() => {
    if (!selectedCompanyType && activeSection === 'info') {
      setActiveSection('type');
    }
  }, [selectedCompanyType, activeSection]);

  // Determinar se pode fechar o dialog
  // Super admins podem sempre fechar, usuários regulares só se tiverem empresas
  const canClose = userProfile?.super_admin === true || userCompanies.length > 0;

  console.log("[CompanySelectionDialog] Dialog state:", {
    open,
    canClose,
    isSuperAdmin: userProfile?.super_admin,
    companiesLength: userCompanies.length
  });

  const handleOpenChange = (shouldOpen: boolean) => {
    console.log("[CompanySelectionDialog] Attempting to change open state to:", shouldOpen);
    
    if (!shouldOpen && !canClose) {
      // Não permitir fechar se o usuário não é super admin e não tem empresas
      console.log("[CompanySelectionDialog] Cannot close - user has no companies and is not super admin");
      return;
    }
    onOpenChange(shouldOpen);
  };

  // Criar conteúdo
  const sections: SettingsSection[] = useMemo(() => {
    const typeContent = (
      <div className="space-y-8">
        {!canClose && !isBannerDismissed && (
          <div className="relative p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 pr-8">
              É necessário criar ou vincular-se a uma empresa para continuar
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBannerDismissed(true)}
              className="absolute right-2 top-2 h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <CompanyTypeSelection 
          onTypeSelect={handleTypeSelect}
          onSwitchToInfo={() => setActiveSection('info')}
        />
      </div>
    );

    const infoContent = (
      <div className="space-y-8">
        <div id="company-form-container">
          {selectedCompanyType === 'new' ? (
            <NewCompanyForm
              onBack={() => {
                setSelectedCompanyType(null);
                setActiveSection('type');
              }}
              onComplete={handleCompanyCreated}
              hideSubmitButton={true}
            />
          ) : selectedCompanyType === 'existing' ? (
            <ExistingCompanyForm
              onBack={() => {
                setSelectedCompanyType(null);
                setActiveSection('type');
              }}
              onComplete={handleCompanyCreated}
              hideSubmitButton={true}
            />
          ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Por favor, selecione um tipo de empresa na seção "Tipo" primeiro.
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveSection('type')}
            >
              Voltar para Tipo
            </Button>
          </div>
        )}
        </div>
      </div>
    );

    return [
      {
        id: 'type',
        label: 'Tipo',
        content: typeContent
      },
      {
        id: 'info',
        label: 'Informações',
        content: infoContent,
        disabled: !selectedCompanyType // Desabilita se nenhum tipo foi selecionado
      }
    ];
  }, [canClose, isBannerDismissed, selectedCompanyType, handleCompanyCreated, handleTypeSelect]);

  // Função para obter o botão do footer baseado na seção ativa
  const getCancelButton = useCallback((activeSection: string): React.ReactNode | null => {
    if (activeSection === 'info') {
      // Na seção Informações, mostrar botão "Criar Empresa"
      const handleCreateCompany = () => {
        // Procurar o formulário dentro do container
        const container = document.getElementById('company-form-container');
        const form = container?.querySelector('form');
        
        if (form) {
          // Tentar encontrar e clicar no botão de submit
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
            return;
          }
          
          // Se não encontrar botão submit, procurar botão "Concluir" (para empresa existente)
          const completeButton = container?.querySelector('button[type="button"]') as HTMLButtonElement;
          if (completeButton && completeButton.textContent?.includes('Concluir') && !completeButton.disabled) {
            completeButton.click();
            return;
          }
          
          // Último recurso: disparar o evento submit do formulário
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      };

      return (
        <Button
          type="button"
          onClick={handleCreateCompany}
          className="min-w-[180px] bg-black hover:bg-black/90 text-white font-medium"
        >
          {selectedCompanyType === 'new' ? 'Criar Empresa' : 'Vincular Empresa'}
        </Button>
      );
    } else {
      // Na seção Tipo, mostrar botão "Trocar a conta de usuário"
      return (
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="min-w-[180px] flex items-center gap-2 text-gray-700 hover:text-red-600 hover:border-red-200"
        >
          <UserCog className="h-4 w-4" strokeWidth={2} />
          Trocar a conta de usuário
        </Button>
      );
    }
  }, [selectedCompanyType, handleLogout]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedCompanyType(null);
      setActiveSection('type');
      setIsBannerDismissed(false); // Reset banner quando o dialog é fechado
    }
  }, [open]);

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Configuração da Empresa"
      sections={sections}
      defaultSectionId="type"
      activeSectionId={activeSection}
      onSectionChange={setActiveSection}
      getCancelButton={getCancelButton}
      maxWidth="max-w-5xl"
      contentPadding="p-8 space-y-8"
      alwaysShowSidebar={true}
    />
  );
};
