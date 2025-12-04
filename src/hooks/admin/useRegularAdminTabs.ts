import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminTabId } from '@/types/admin';
import { 
  getDefaultAdminTab, 
  isValidRegularAdminTab,
  getRegularAdminTabs 
} from '@/config/adminTabsConfig';
import { useIsAdmin } from '@/hooks/company/useIsAdmin';

/**
 * Hook para gerenciar o estado e navegação das tabs do admin regular
 * Admin regular NUNCA vê a tab "Plataforma", mesmo que seja super admin
 */
export const useRegularAdminTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, isSuperAdmin } = useIsAdmin();
  
  // Estado local da tab ativa - inicializa com 'dashboard' como padrão seguro
  const [activeTab, setActiveTabState] = useState<AdminTabId>('dashboard');
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Tabs disponíveis para admin regular (sem Plataforma)
  const availableTabs = useMemo(() => {
    return getRegularAdminTabs();
  }, []);

  // Inicialização única - sincroniza com URL na primeira carga
  useEffect(() => {
    if (isInitialized) return;
    
    // Inicializar com tab padrão imediatamente
    const defaultTab = getDefaultAdminTab(isSuperAdmin);
    // Garantir que não seja 'platform'
    const safeDefaultTab = defaultTab === 'platform' ? 'dashboard' : defaultTab;
    setActiveTabState(safeDefaultTab);

    const tabParam = searchParams.get('tab');
    
    let initialTab: AdminTabId;
    
    if (tabParam && isValidRegularAdminTab(tabParam)) {
      initialTab = tabParam as AdminTabId;
    } else {
      initialTab = safeDefaultTab;
    }
    
    // Atualizar URL se necessário
    if (!tabParam || !isValidRegularAdminTab(tabParam)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', initialTab);
      setSearchParams(newParams, { replace: true });
    }
    
    setActiveTabState(initialTab);
    setIsInitialized(true);
  }, [isSuperAdmin, isInitialized, searchParams, setSearchParams]);

  // Sincronizar com mudanças na URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && isValidRegularAdminTab(tabParam)) {
      const newTab = tabParam as AdminTabId;
      if (newTab !== activeTab) {
        setActiveTabState(newTab);
      }
    } else if (isInitialized) {
      // Se a tab na URL não é válida, redirecionar para padrão
      const defaultTab = getDefaultAdminTab(isSuperAdmin);
      const safeDefaultTab = defaultTab === 'platform' ? 'dashboard' : defaultTab;
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', safeDefaultTab);
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, isSuperAdmin, activeTab, isInitialized, setSearchParams]);

  // Handler para mudança de tab pelo usuário
  const handleTabChange = useCallback((tab: AdminTabId) => {
    if (!isValidRegularAdminTab(tab)) {
      console.warn(`Tab "${tab}" não está disponível para admin regular`);
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
    isSuperAdmin,
    isAdmin
  };
};

