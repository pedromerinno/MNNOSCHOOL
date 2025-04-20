
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
    const updateData = isSuperAdmin 
      ? { super_admin: isAdmin }
      : { is_admin: isAdmin };
      
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error(`Erro ao atualizar status de admin: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erro ao definir status de admin:', error);
    throw error;
  }
};

// Alterando esta função para usar diretamente o supabase.rpc
export const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.warn("Error checking admin status:", error);
      return false;
    }
    
    return !!data.is_admin;
  } catch (e) {
    console.error("Exception checking admin status:", e);
    return false;
  }
};

// Alterando esta função para usar diretamente o supabase.rpc
export const checkIfUserIsSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('super_admin')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.warn("Error checking super admin status:", error);
      return false;
    }
    
    return !!data.super_admin;
  } catch (e) {
    console.error("Exception checking super admin status:", e);
    return false;
  }
};
