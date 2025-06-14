
import React, { useState, useEffect } from 'react';
import { useCompanyCheck } from '@/hooks/useCompanyCheck';
import { CompanySelectionDialog } from '@/components/home/CompanySelectionDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

interface CompanyRequiredCheckProps {
  children: React.ReactNode;
}

export const CompanyRequiredCheck: React.FC<CompanyRequiredCheckProps> = ({ children }) => {
  const { needsCompany, isChecking, forceRecheck } = useCompanyCheck();
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

  // Se ainda está verificando, não mostra nada
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Efeito sempre executado, mas com condições internas
  useEffect(() => {
    if (needsCompany && !showCompanyDialog) {
      setShowCompanyDialog(true);
    }
  }, [needsCompany, showCompanyDialog]);

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
    forceRecheck();
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    // Pode ser usado para lógica futura se necessário
    console.log('Company type selected:', isExisting);
  };

  return (
    <>
      {children}
      
      <CompanySelectionDialog
        open={showCompanyDialog}
        onOpenChange={(open) => {
          // Não permite fechar o diálogo se o usuário ainda precisa de empresa
          if (!open && needsCompany) {
            return;
          }
          setShowCompanyDialog(open);
        }}
        onCompanyTypeSelect={handleCompanyTypeSelect}
        onCompanyCreated={handleCompanyCreated}
        userId={user?.id}
        forceGetUserCompanies={forceGetUserCompanies}
      />
    </>
  );
};
