
import { supabase } from "@/integrations/supabase/client";

// Definir uma interface simplificada para usuários Supabase
interface SupabaseUser {
  id: string;
  email?: string | null;
}

export const makeUserAdmin = async (targetEmail: string) => {
  try {
    console.log(`Attempting to make ${targetEmail} an admin...`);
    
    // Primeiro tenta obter o usuário diretamente de profiles com base no email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('email', targetEmail)
      .maybeSingle();
    
    let userId;
    
    // Se não encontrarmos pelo email em profiles, tentamos auth.users
    if (profileError || !profileData) {
      console.log('User not found in profiles by email, trying auth.users...');
      
      // Tratar a resposta como "any" para evitar problemas de inferência de tipos
      const { data: authData, error: authError }: any = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching users:', authError);
        throw authError;
      }
      
      if (!authData || !Array.isArray(authData.users)) {
        console.error('Invalid response format from listUsers');
        throw new Error('Invalid response format from listUsers');
      }
      
      // Converter explicitamente para nossa interface simples
      const users = authData.users as SupabaseUser[];
      const targetUser = users.find(u => u.email === targetEmail);
      
      if (!targetUser) {
        console.error(`User with email ${targetEmail} not found`);
        throw new Error(`User with email ${targetEmail} not found`);
      }
      
      userId = targetUser.id;
    } else {
      userId = profileData.id;
      
      // Se o usuário já for admin, apenas retornamos
      if (profileData.is_admin) {
        console.log(`${targetEmail} is already an admin.`);
        return true;
      }
    }
    
    console.log(`Found user ID: ${userId}, updating admin status...`);
    
    // Tornar o usuário um admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating admin status:', updateError);
      throw updateError;
    }
    
    console.log(`Successfully made ${targetEmail} an admin`);
    return true;
  } catch (error: any) {
    console.error('Error in makeUserAdmin function:', error);
    throw error;
  }
};

// Função para definir diretamente o status de admin pelo ID do usuário
export const setAdminStatusById = async (userId: string, isAdmin: boolean) => {
  try {
    console.log(`Setting admin status to ${isAdmin} for user ID: ${userId}`);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log(`Successfully updated admin status for user ID: ${userId}`);
    return true;
  } catch (error: any) {
    console.error('Error setting admin status:', error);
    throw error;
  }
};
