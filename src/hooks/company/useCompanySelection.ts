
import { useCallback, useRef } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanyCache } from "./useCompanyCache";

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
  setCompanyContentLoaded?: (loaded: boolean) => void;
}

export const useCompanySelection = ({ 
  setSelectedCompany,
  setCompanyContentLoaded 
}: UseCompanySelectionProps) => {
  const { cacheSelectedCompany, invalidateCache } = useCompanyCache();
  const lastSelectionRef = useRef<string | null>(null);
  
  const selectCompany = useCallback(async (userId: string, company: Company) => {
    // Skip if the same company is being selected again
    if (lastSelectionRef.current === company.id) {
      console.log(`[useCompanySelection] Company ${company.nome} already selected, skipping`);
      return true;
    }
    
    console.log(`[useCompanySelection] Selecting company: ${company.nome}`);
    
    // Verificar se o usuário tem acesso a esta empresa
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', userId)
        .eq('empresa_id', company.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        // PGRST116 é "Did not find a result", que é esperado se o usuário for super admin
        console.warn(`[useCompanySelection] Verificando permissão do usuário: ${error.message}`);
        
        // Verificar se o usuário é super admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('super_admin')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          throw new Error(`Erro ao verificar permissões: ${profileError.message}`);
        }
        
        if (!profile?.super_admin) {
          throw new Error('Você não tem permissão para acessar esta empresa');
        }
      }
      
      // Set the last selected company ID to prevent duplicate selections
      lastSelectionRef.current = company.id;
      
      // Invalidar cache antes de definir nova empresa
      invalidateCache();
      
      // Definir a empresa selecionada
      setSelectedCompany(company);
      
      // Armazenar no cache com nova versão
      cacheSelectedCompany(company);
      
      // Reiniciar o estado de carregamento de conteúdo para a nova empresa
      if (setCompanyContentLoaded) {
        setCompanyContentLoaded(false);
      }
      
      // Despachar evento para notificar outros componentes (apenas uma vez)
      const event = new CustomEvent('company-selected', {
        detail: { company }
      });
      window.dispatchEvent(event);
      
      // Também despachar evento de atualização para garantir que todos os componentes saibam
      // que houve uma mudança de empresa
      const updateEvent = new CustomEvent('company-updated', {
        detail: { company }
      });
      
      // Pequeno atraso para garantir que o evento de seleção foi processado primeiro
      setTimeout(() => {
        window.dispatchEvent(updateEvent);
      }, 50);
      
      return true;
    } catch (error: any) {
      console.error('[useCompanySelection] Error selecting company:', error);
      toast.error(error.message || 'Erro ao selecionar empresa');
      return false;
    }
  }, [setSelectedCompany, setCompanyContentLoaded, cacheSelectedCompany, invalidateCache]);

  return { selectCompany };
};
