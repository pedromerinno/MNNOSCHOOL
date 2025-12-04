import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';

// Cache para evitar múltiplas queries
const adminStatusCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

/**
 * Hook para verificar se o usuário é admin de uma empresa específica
 * Otimizado para usar dados do AuthContext quando disponível e função RPC para melhor performance
 */
export const useUserCompanyAdmin = (userId?: string) => {
  const { selectedCompany } = useCompanies();
  const { userProfile, profileLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  // Sempre começar como loading se o perfil não estiver pronto
  const [isLoading, setIsLoading] = useState(() => {
    return profileLoading || !userProfile;
  });
  const lastCheckedRef = useRef<string | null>(null);
  const previousCompanyIdRef = useRef<string | null>(null);
  
  // Atualizar isLoading quando profileLoading ou userProfile mudarem
  useEffect(() => {
    if (profileLoading || !userProfile) {
      setIsLoading(true);
      setIsAdmin(false);
    }
  }, [profileLoading, userProfile]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentCompanyId = selectedCompany?.id || null;
        
        // Se a empresa mudou desde a última verificação, resetar estado e forçar nova verificação
        if (previousCompanyIdRef.current !== currentCompanyId) {
          // Resetar estado imediatamente
          setIsAdmin(false);
          setIsLoading(true);
          // Limpar referência para forçar nova verificação
          lastCheckedRef.current = null;
          // Atualizar referência da empresa atual
          previousCompanyIdRef.current = currentCompanyId;
        }

        // OTIMIZAÇÃO: Verificar super_admin PRIMEIRO usando userProfile (sem query)
        // Se o perfil já está carregado e sabemos que é super_admin, retornar imediatamente
        if (userProfile && !profileLoading && userProfile.super_admin === true) {
          const cacheKey = `super_admin_${currentCompanyId || 'none'}`;
          const now = Date.now();
          setIsAdmin(true);
          adminStatusCache.set(cacheKey, { isAdmin: true, timestamp: now });
          setIsLoading(false);
          lastCheckedRef.current = cacheKey;
          return;
        }

        // Se o perfil ainda está carregando, aguardar
        if (profileLoading || !userProfile) {
          setIsAdmin(false);
          setIsLoading(true);
          return;
        }

        // Se userId não foi fornecido, usar o ID do userProfile (já disponível)
        const targetUserId = userId || userProfile.id;
        
        if (!targetUserId) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Criar chave de cache baseada no userId e companyId
        const cacheKey = `${targetUserId}_${currentCompanyId || 'none'}`;
        
        // Se a empresa não mudou e já verificamos recentemente, verificar cache
        const cached = adminStatusCache.get(cacheKey);
        const now = Date.now();
        const isCacheValid = cached && (now - cached.timestamp) < CACHE_DURATION;
        const hasCheckedBefore = lastCheckedRef.current === cacheKey;
        const companyDidNotChange = previousCompanyIdRef.current === currentCompanyId;
        
        // Se já verificamos para esta empresa recentemente E a empresa não mudou, usar cache
        if (hasCheckedBefore && companyDidNotChange && isCacheValid) {
          // Usar cache apenas se realmente temos confirmação
          setIsAdmin(cached.isAdmin);
          setIsLoading(false);
          return;
        }
        
        // Atualizar referência antes de fazer a verificação
        lastCheckedRef.current = cacheKey;

        // IMPORTANTE: Sempre começar como false quando iniciar nova verificação
        // Isso previne que valores antigos sejam mostrados durante a verificação
        setIsAdmin(false);
        setIsLoading(true);

        // Se não há empresa selecionada, verificar se é admin de alguma empresa
        if (!currentCompanyId) {
          // Usar função RPC otimizada se disponível, senão fallback para query direta
          try {
            const { data: adminCompanies, error: adminError } = await supabase
              .from('user_empresa')
              .select('is_admin')
              .eq('user_id', targetUserId)
              .eq('is_admin', true)
              .limit(1);

            if (adminError) {
              console.error('Error checking admin status:', adminError);
              setIsAdmin(false);
            } else {
              // Se é admin de alguma empresa, permitir acesso (aguardar seleção da empresa)
              const hasAdminAccess = (adminCompanies?.length || 0) > 0;
              setIsAdmin(hasAdminAccess);
              adminStatusCache.set(cacheKey, { isAdmin: hasAdminAccess, timestamp: now });
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          }
          setIsLoading(false);
          return;
        }

        // Usar função RPC otimizada is_admin_for_company que é mais rápida
        // Esta função já verifica super_admin internamente e faz query otimizada
        try {
          const { data: isAdminResult, error: rpcError } = await supabase
            .rpc('is_admin_for_company', { company_id_param: currentCompanyId });

          if (rpcError) {
            // Fallback para query direta se RPC falhar
            console.warn('RPC failed, using direct query:', rpcError);
            const { data: userCompany, error } = await supabase
              .from('user_empresa')
              .select('is_admin')
              .eq('user_id', targetUserId)
              .eq('empresa_id', currentCompanyId)
              .single();

            if (error && error.code !== 'PGRST116') {
              console.error('Error checking admin status:', error);
              setIsAdmin(false);
            } else {
              const adminStatus = userCompany?.is_admin || false;
              setIsAdmin(adminStatus);
              adminStatusCache.set(cacheKey, { isAdmin: adminStatus, timestamp: now });
            }
          } else {
            // RPC retorna boolean diretamente
            const adminStatus = isAdminResult === true;
            setIsAdmin(adminStatus);
            adminStatusCache.set(cacheKey, { isAdmin: adminStatus, timestamp: now });
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [selectedCompany?.id, userId, userProfile?.super_admin, userProfile?.id, profileLoading, userProfile]);

  return {
    isAdmin,
    isLoading,
  };
};

