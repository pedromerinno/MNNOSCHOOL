
import { useCallback, useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from '@/hooks/useUsers';

// Cache para evitar múltiplas queries
const CACHE_KEY_PREFIX = 'company_users_';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos
const companyUsersCache = new Map<string, { data: UserProfile[]; timestamp: number }>();

export const useCompanyUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedCompanyId = useRef<string | null>(null);
  
  // Função para obter cache
  const getCachedUsers = useCallback((companyId: string): UserProfile[] | null => {
    try {
      const cached = companyUsersCache.get(companyId);
      if (!cached) return null;

      const now = Date.now();
      if (now - cached.timestamp < CACHE_EXPIRATION) {
        console.log('[useCompanyUserManagement] Usando cache para empresa:', companyId);
        return cached.data;
      }
      
      // Cache expirado, remover
      companyUsersCache.delete(companyId);
      return null;
    } catch (e) {
      console.warn('[useCompanyUserManagement] Erro ao ler cache:', e);
      return null;
    }
  }, []);

  // Função para salvar cache
  const setCachedUsers = useCallback((companyId: string, data: UserProfile[]) => {
    try {
      companyUsersCache.set(companyId, {
        data,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('[useCompanyUserManagement] Erro ao salvar cache:', e);
    }
  }, []);

  const assignUserToCompany = useCallback(async (userId: string, companyId: string, isAdmin: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: userId,
          empresa_id: companyId,
          is_admin: isAdmin
        })
        .select()
        .single();
  
      if (error) throw error;
      
      // Limpar cache da empresa para forçar refresh
      companyUsersCache.delete(companyId);
      lastFetchedCompanyId.current = null;
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
      toast.success("Usuário adicionado à empresa com sucesso!");
      return data;
    } catch (error) {
      console.error('Error assigning user to company:', error);
      toast.error("Erro ao adicionar usuário à empresa");
      throw error;
    }
  }, []);
  
  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .match({
          user_id: userId,
          empresa_id: companyId
        });
  
      if (error) throw error;
      
      // Limpar cache da empresa para forçar refresh
      companyUsersCache.delete(companyId);
      lastFetchedCompanyId.current = null;
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
      toast.success("Usuário removido da empresa com sucesso!");
      return true;
    } catch (error) {
      console.error('Error removing user from company:', error);
      toast.error("Erro ao remover usuário da empresa");
      throw error;
    }
  }, []);
  
  const getCompanyUsers = useCallback(async (companyId: string): Promise<UserProfile[]> => {
    try {
      // Evitar fetch duplicado
      if (lastFetchedCompanyId.current === companyId) {
        const cached = getCachedUsers(companyId);
        if (cached) {
          console.log('[useCompanyUserManagement] Evitando fetch duplicado, usando cache para empresa:', companyId);
          return cached;
        }
      }

      // Verificar cache primeiro
      const cachedData = getCachedUsers(companyId);
      if (cachedData && cachedData.length > 0) {
        console.log('[useCompanyUserManagement] Usando dados do cache para empresa:', companyId);
        return cachedData;
      }

      console.log('[useCompanyUserManagement] Buscando usuários para empresa:', companyId);
      
      // Usar função RPC otimizada get_company_users que faz tudo em uma única query
      // Esta função já está otimizada com índices e faz JOIN interno no banco
      // Muito mais rápido que fazer 2 queries separadas (user_empresa + profiles)
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_company_users', { _empresa_id: companyId });
        
      if (usersError) throw usersError;
      
      if (!usersData || usersData.length === 0) {
        console.log('[useCompanyUserManagement] Nenhum usuário encontrado na empresa');
        const emptyResult: UserProfile[] = [];
        setCachedUsers(companyId, emptyResult);
        lastFetchedCompanyId.current = companyId;
        return emptyResult;
      }

      console.log('[useCompanyUserManagement] Dados recebidos:', usersData.length, 'usuários');

      // Transformar dados da RPC para formato UserProfile
      // A RPC já retorna tudo combinado, então só precisamos mapear
      const users: UserProfile[] = usersData.map((user: any) => ({
        id: user.id,
        display_name: user.display_name,
        email: user.email,
        avatar: user.avatar,
        super_admin: user.super_admin || false,
        created_at: user.created_at,
        aniversario: user.aniversario,
        cidade: user.cidade,
        // Campos da empresa
        is_admin: user.is_admin || false,
        cargo_id: user.cargo_id || null,
        cargo_title: user.cargo_title || null,
        tipo_contrato: user.tipo_contrato || null,
        data_inicio: user.data_inicio || null,
        manual_cultura_aceito: user.manual_cultura_aceito || null,
        nivel_colaborador: user.nivel_colaborador || null
      }));

      // Salvar no cache
      setCachedUsers(companyId, users);
      lastFetchedCompanyId.current = companyId;
      
      console.log('[useCompanyUserManagement] Usuários carregados com sucesso:', users.length);
      return users;
    } catch (error) {
      console.error('[useCompanyUserManagement] Erro ao buscar usuários:', error);
      throw error;
    }
  }, [getCachedUsers, setCachedUsers]);
  
  return {
    assignUserToCompany,
    removeUserFromCompany,
    getCompanyUsers,
    isLoading
  };
};
