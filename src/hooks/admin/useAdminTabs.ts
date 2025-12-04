import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminTabId } from '@/types/admin';
import { 
  getDefaultAdminTab, 
  isValidAdminTab,
  getAvailableAdminTabs 
} from '@/config/adminTabsConfig';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para gerenciar o estado e navegação das tabs do admin
 * Centraliza toda a lógica de inicialização, navegação e sincronização com URL
 */
export const useAdminTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useAuth();
  
  const isSuperAdmin = Boolean(userProfile?.super_admin);
  const isAdmin = Boolean(userProfile?.is_admin || userProfile?.super_admin);
  
  // Estado local da tab ativa - inicializa com 'dashboard' como padrão seguro
  const [activeTab, setActiveTabState] = useState<AdminTabId>('dashboard');
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Tabs disponíveis baseado em permissões
  const availableTabs = useMemo(() => {
    return getAvailableAdminTabs(isSuperAdmin);
  }, [isSuperAdmin]);

  // Inicialização única - sincroniza com URL na primeira carga
  // Otimizado: inicializa imediatamente com tab padrão, depois sincroniza com URL
  useEffect(() => {
    if (isInitialized) return;
    
    // Inicializar com tab padrão imediatamente para não bloquear renderização
    const defaultTab = getDefaultAdminTab(isSuperAdmin);
    setActiveTabState(defaultTab);
    
    // Se não tem userProfile ainda, inicializar com tab padrão mas não marcar como inicializado
    // Isso permite renderização rápida enquanto aguarda perfil
    if (!userProfile) {
      // Aguardar um pouco para ver se o perfil carrega rapidamente
      const timeout = setTimeout(() => {
        // Se após 500ms ainda não tem perfil, marcar como inicializado mesmo assim
        // O AdminRouteGuard vai lidar com a verificação de permissões
        setIsInitialized(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }

    const tabParam = searchParams.get('tab');
    
    let initialTab: AdminTabId;
    
    if (tabParam && isValidAdminTab(tabParam, isSuperAdmin)) {
      initialTab = tabParam as AdminTabId;
    } else {
      initialTab = defaultTab;
    }
    
    // Atualizar URL se necessário
    if (!tabParam || !isValidAdminTab(tabParam, isSuperAdmin)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', initialTab);
      setSearchParams(newParams, { replace: true });
    }
    
    setActiveTabState(initialTab);
    setIsInitialized(true);
  }, [userProfile, isSuperAdmin, isInitialized, searchParams, setSearchParams]);

  // Sincronizar com mudanças na URL (navegação do navegador)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && isValidAdminTab(tabParam, isSuperAdmin)) {
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
    if (!isValidAdminTab(tab, isSuperAdmin)) {
      console.warn(`Tab "${tab}" não está disponível para este usuário`);
      return;
    }
    
    setActiveTabState(tab);
    
    // Atualizar URL sem causar recarregamento
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  }, [isSuperAdmin, searchParams, setSearchParams]);

  return {
    activeTab,
    handleTabChange,
    isInitialized,
    availableTabs,
    isSuperAdmin,
    isAdmin
  };
};

