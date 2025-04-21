
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { UseCompanyStateReturn } from './types/stateTypes';

interface UseCompanyInitializationProps extends Pick<UseCompanyStateReturn, 'setUserCompanies' | 'setIsLoading'> {
  skipLoadingInOnboarding?: boolean;
  getUserCompanies: (userId: string, showLoading?: boolean) => Promise<Company[]>;
}

export const useCompanyInitialization = ({
  skipLoadingInOnboarding = false,
  setUserCompanies,
  setIsLoading,
  getUserCompanies
}: UseCompanyInitializationProps) => {
  const initialDataLoaded = useRef(false);

  const loadInitialData = useCallback(async (userId: string) => {
    if (initialDataLoaded.current) {
      return;
    }
    
    if (skipLoadingInOnboarding) {
      console.log("[useCompanies] Pulando carregamento de empresas durante onboarding");
      return;
    }
    
    try {
      initialDataLoaded.current = true;
      console.log("[useCompanies] Carregando dados iniciais de empresas");
      
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const companies = JSON.parse(cachedData);
          if (Array.isArray(companies) && companies.length > 0) {
            setUserCompanies(companies);
            console.log("[useCompanies] Usando dados em cache durante carregamento inicial");
            
            getUserCompanies(userId, false).catch(err => 
              console.error('[useCompanies] Erro ao atualizar dados de empresas em background:', err)
            );
            return;
          }
        } catch (e) {
          console.error('[useCompanies] Erro ao analisar cache de empresas:', e);
        }
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('super_admin, is_admin')
        .eq('id', userId)
        .single();
      
      if (profileData?.super_admin) {
        console.log('[useCompanies] Usuário é super admin, buscando todas as empresas');
        const { data: allCompanies } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
        
        setUserCompanies(allCompanies as Company[] || []);
      } else {
        console.log('[useCompanies] Buscando empresas do usuário:', userId);
        await getUserCompanies(userId);
      }
    } catch (error) {
      console.error('[useCompanies] Erro ao carregar dados iniciais de empresas:', error);
    }
  }, [skipLoadingInOnboarding, setUserCompanies, getUserCompanies]);

  return { loadInitialData };
};
