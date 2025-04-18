
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UseAdminActions, UseProfileState } from "./types";

export const useAdminActions = ({ userProfile, setUserProfile }: UseProfileState): UseAdminActions => {
  const { toast } = useToast();

  const makeAdmin = async () => {
    try {
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      if (!isAdminColumnExists) {
        toast({
          title: "Funcionalidade não disponível",
          description: "A funcionalidade de administrador ainda não está disponível. Por favor, configure o banco de dados primeiro.",
          variant: "destructive",
        });
        return;
      }
      
      const updatedProfile = {
        ...userProfile,
        isAdmin: true
      };

      const userData = await supabase.auth.getUser();
      const userId = userData.data.user?.id;

      if (!userId) {
        toast({
          title: "Erro ao atualizar perfil",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        throw new Error("User not found");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error making user admin:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      setUserProfile(updatedProfile);
      
      toast({
        title: "Perfil atualizado",
        description: "Você agora é um administrador.",
      });
    } catch (error: any) {
      console.error('Exception making user admin:', error);
      throw error;
    }
  };

  return { makeAdmin };
};
