
import { UserProfile } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const isSuperAdmin = (userProfile: UserProfile | null): boolean => {
  return !!userProfile?.super_admin;
};

export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return !!userProfile?.is_admin || !!userProfile?.super_admin;
};

export const makeUserAdmin = async (email: string): Promise<void> => {
  try {
    // First busca o usuário pelo email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      throw new Error(`Usuário não encontrado: ${userError.message}`);
    }

    // Atualiza o status de admin do usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userData.id);

    if (updateError) {
      throw new Error(`Erro ao atualizar status de admin: ${updateError.message}`);
    }
  } catch (error: any) {
    console.error('Erro ao definir usuário como admin:', error);
    throw error;
  }
};

export const setAdminStatusById = async (
  userId: string, 
  isAdmin: boolean, 
  isSuperAdmin: boolean = false
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_admin: isAdmin,
        super_admin: isSuperAdmin 
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Erro ao atualizar status de admin: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erro ao definir status de admin:', error);
    throw error;
  }
};

// Added safe RPC functions to avoid recursion issues
export const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('get_is_admin_secure', { user_id: userId });
      
    if (error) {
      console.warn("Error checking admin status via RPC:", error);
      return false;
    }
    
    return data === true;
  } catch (e) {
    console.error("Exception checking admin status:", e);
    return false;
  }
};

export const checkIfUserIsSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('get_is_super_admin_secure', { user_id: userId });
      
    if (error) {
      console.warn("Error checking super admin status via RPC:", error);
      return false;
    }
    
    return data === true;
  } catch (e) {
    console.error("Exception checking super admin status:", e);
    return false;
  }
};
