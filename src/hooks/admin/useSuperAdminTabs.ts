import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminTabId } from '@/types/admin';
import { 
  getDefaultAdminTab, 
  isValidSuperAdminTab,
  getSuperAdminTabs 
} from '@/config/adminTabsConfig';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para gerenciar o estado e navegação das tabs do super admin
 * Super admin vê TODAS as tabs, incluindo "Plataforma"
 */
export const useSuperAdminTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useAuth();
  
  const isSuperAdmin = Boolean(userProfile?.super_admin);
  
  // Estado local da tab ativa - inicializa com 'dashboard' como padrão seguro
  const [activeTab, setActiveTabState] = useState<AdminTabId>('dashboard');
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Tabs disponíveis para super admin (todas, incluindo Plataforma)
  const availableTabs = useMemo(() => {
    return getSuperAdminTabs();
  }, []);

  // Inicialização única - sincroniza com URL na primeira carga
  useEffect(() => {
    if (isInitialized) return;
    
    // Inicializar com tab padrão imediatamente
    const defaultTab = getDefaultAdminTab(isSuperAdmin);
    setActiveTabState(defaultTab);
    
    if (!userProfile) {
      const timeout = setTimeout(() => {
        setIsInitialized(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }

    const tabParam = searchParams.get('tab');
    
    let initialTab: AdminTabId;
    
    if (tabParam && isValidSuperAdminTab(tabParam)) {
      initialTab = tabParam as AdminTabId;
    } else {
      initialTab = defaultTab;
    }
    
    // Atualizar URL se necessário
    if (!tabParam || !isValidSuperAdminTab(tabParam)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', initialTab);
      setSearchParams(newParams, { replace: true });
    }
    
    setActiveTabState(initialTab);
    setIsInitialized(true);
  }, [userProfile, isSuperAdmin, isInitialized, searchParams, setSearchParams]);

  // Sincronizar com mudanças na URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && isValidSuperAdminTab(tabParam)) {
      const newTab = tabParam as AdminTabId;
      if (newTab !== activeTab) {
        setActiveTabState(newTab);
      }
    } else if (isInitialized) {
      // Se a tab na URL não é válida, redirecionar para padrão
      const defaultTab = getDefaultAdminTab(isSuperAdmin);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', defaultTab);
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, isSuperAdmin, activeTab, isInitialized, setSearchParams]);

  // Handler para mudança de tab pelo usuário
  const handleTabChange = useCallback((tab: AdminTabId) => {
    if (!isValidSuperAdminTab(tab)) {
      console.warn(`Tab "${tab}" não está disponível`);
      return;
    }
    
    setActiveTabState(tab);
    
    // Atualizar URL sem causar recarregamento
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return {
    activeTab,
    handleTabChange,
    isInitialized,
    availableTabs,
    isSuperAdmin
  };
};

