
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

export const useCompanyCheck = () => {
  const { user, userProfile } = useAuth();
  const { userCompanies, isLoading } = useCompanies();
  const [needsCompany, setNeedsCompany] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkUserCompany = useCallback(() => {
    if (!user || !userProfile || isLoading) {
      setIsChecking(true);
      return;
    }

    // Super admins sempre têm acesso, não precisam de empresa vinculada
    if (userProfile.super_admin) {
      setNeedsCompany(false);
      setIsChecking(false);
      return;
    }

    // Se o usuário não tem empresas vinculadas, precisa criar/vincular
    const hasCompanies = userCompanies && userCompanies.length > 0;
    setNeedsCompany(!hasCompanies);
    setIsChecking(false);
  }, [user, userProfile, userCompanies, isLoading]);

  useEffect(() => {
    checkUserCompany();
  }, [checkUserCompany]);

  const forceRecheck = useCallback(() => {
    setIsChecking(true);
    setTimeout(() => {
      checkUserCompany();
    }, 500);
  }, [checkUserCompany]);

  return {
    needsCompany,
    isChecking,
    forceRecheck
  };
};
