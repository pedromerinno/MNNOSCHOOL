
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanySelectionDialog } from '@/components/home/CompanySelectionDialog';
import { MainNavigationMenu } from '@/components/navigation/MainNavigationMenu';

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

export const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { userCompanies, isLoading, forceGetUserCompanies } = useCompanies();
  const [showCompanyDialog, setShowCompanyDialog] = React.useState(false);

  // Always execute hooks in the same order
  const needsCompany = React.useMemo(() => {
    if (!user || !userProfile || isLoading) {
      return false;
    }

    // Super admins don't need company association
    if (userProfile.super_admin) {
      return false;
    }

    // Regular users need at least one company
    return !userCompanies || userCompanies.length === 0;
  }, [user, userProfile, userCompanies, isLoading]);

  const isChecking = !user || !userProfile || isLoading;

  React.useEffect(() => {
    if (needsCompany && !showCompanyDialog && !isChecking) {
      setShowCompanyDialog(true);
    }
  }, [needsCompany, showCompanyDialog, isChecking]);

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log('Company type selected:', isExisting);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <MainNavigationMenu />
      {children}
      
      <CompanySelectionDialog
        open={showCompanyDialog}
        onOpenChange={(open) => {
          if (!open && needsCompany) {
            return; // Don't allow closing if user still needs company
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
