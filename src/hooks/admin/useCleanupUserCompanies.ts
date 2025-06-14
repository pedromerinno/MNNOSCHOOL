
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCleanupUserCompanies = () => {
  
  const cleanupUserCompanies = useCallback(async (userId: string, keepCompanyId?: string) => {
    try {
      console.log('Limpando vinculações duplicadas para usuário:', userId);
      
      // Se foi especificada uma empresa para manter, remove todas as outras
      if (keepCompanyId) {
        const { error } = await supabase
          .from('user_empresa')
          .delete()
          .eq('user_id', userId)
          .neq('empresa_id', keepCompanyId);
          
        if (error) {
          throw error;
        }
        
        console.log('Vinculações limpas, mantendo apenas empresa:', keepCompanyId);
        toast.success('Vinculações de empresa corrigidas');
      } else {
        // Buscar todas as vinculações do usuário
        const { data: relations, error: fetchError } = await supabase
          .from('user_empresa')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (fetchError) {
          throw fetchError;
        }
        
        if (relations && relations.length > 1) {
          // Manter apenas a vinculação mais recente
          const keepRelation = relations[0];
          const removeRelations = relations.slice(1);
          
          for (const relation of removeRelations) {
            const { error: deleteError } = await supabase
              .from('user_empresa')
              .delete()
              .eq('id', relation.id);
              
            if (deleteError) {
              console.error('Erro ao remover vinculação:', deleteError);
            }
          }
          
          console.log(`Mantida apenas a vinculação mais recente: ${keepRelation.empresa_id}`);
          toast.success('Vinculações duplicadas removidas');
        }
      }
      
      // Disparar evento para atualizar dados
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
    } catch (error) {
      console.error('Erro ao limpar vinculações:', error);
      toast.error('Erro ao corrigir vinculações de empresa');
    }
  }, []);
  
  return {
    cleanupUserCompanies
  };
};
