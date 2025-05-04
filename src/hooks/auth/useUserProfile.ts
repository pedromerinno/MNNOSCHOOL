
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      console.log("Buscando perfil do usuário:", userId);

      // Verificar se o perfil existe
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log("Perfil não encontrado. Criando perfil para:", userId);
          
          // Se o perfil não existir, criar um novo com primeiro_login=true
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            const email = userData.user.email;
            const displayName = userData.user.user_metadata?.display_name || 
                              email?.split('@')[0] || 
                              'Usuário';
                              
            // Para login social, garante que o usuário faça onboarding
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: userId, 
                display_name: displayName,
                email: email,
                primeiro_login: true,
                interesses: ["onboarding_incomplete"]
              }]);

            if (insertError) {
              console.error("Erro ao criar perfil:", insertError);
              toast.error("Erro ao criar perfil de usuário");
              throw insertError;
            }

            // Buscar perfil após criar
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (newProfile) {
              setUserProfile(newProfile as UserProfile);
            }
          }
        } else {
          console.error("Erro ao buscar perfil:", profileError);
          throw profileError;
        }
      } else if (profileData) {
        setUserProfile(profileData as UserProfile);
      }
    } catch (error) {
      console.error("Erro ao processar perfil do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (userData: any) => {
    try {
      setLoading(true);
      
      // Atualizar apenas o perfil em memória
      setUserProfile(prev => {
        if (!prev) return null;
        return { ...prev, ...userData };
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil do usuário em memória:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserData = useCallback(async (userId: string, userData: any) => {
    try {
      setLoading(true);
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);
        
      if (error) {
        console.error("Erro ao atualizar perfil no banco de dados:", error);
        throw error;
      }
      
      // Atualizar na memória
      setUserProfile(prev => {
        if (!prev) return null;
        return { ...prev, ...userData };
      });
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      toast.error("Erro ao atualizar dados do usuário");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    userProfile,
    loading,
    fetchUserProfile,
    updateUserProfile,
    updateUserData
  };
};
