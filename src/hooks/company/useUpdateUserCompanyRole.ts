import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook para atualizar o cargo de um usuário em uma empresa específica
 */
export const useUpdateUserCompanyRole = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateUserCompanyRole = async (
    userId: string,
    companyId: string,
    cargoId: string | null
  ) => {
    setIsUpdating(true);
    try {
      // Verificar se a associação existe
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('id')
        .eq('user_id', userId)
        .eq('empresa_id', companyId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRelation) {
        // Atualizar a associação existente
        const { error: updateError } = await supabase
          .from('user_empresa')
          .update({ cargo_id: cargoId })
          .eq('id', existingRelation.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova associação (se não existir)
        const { error: insertError } = await supabase
          .from('user_empresa')
          .insert({
            user_id: userId,
            empresa_id: companyId,
            cargo_id: cargoId,
            is_admin: false,
          });

        if (insertError) throw insertError;
      }

      // Disparar evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('user-company-role-updated', {
        detail: { userId, companyId, cargoId }
      }));

      toast.success('Cargo atualizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user company role:', error);
      toast.error(error.message || 'Erro ao atualizar cargo');
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateUserCompanyRole,
    isUpdating,
  };
};

