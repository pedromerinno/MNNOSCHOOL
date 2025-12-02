import { supabase } from "@/integrations/supabase/client";

/**
 * Set admin status for a user by ID
 * 
 * NOTE: is_admin foi removido de profiles. 
 * - Para super_admin: atualiza profiles.super_admin
 * - Para admin de empresa: deve usar user_empresa.is_admin
 */
export const setAdminStatusById = async (
  userId: string, 
  isAdmin: boolean,
  isSuperAdmin: boolean = false
): Promise<boolean> => {
  try {
    if (isSuperAdmin) {
      // Super admin vai em profiles
      console.log(`Setting super admin status to ${isAdmin} for user ID: ${userId}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          super_admin: isAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      console.log(`Successfully updated super admin status for user ID: ${userId}`);
      return true;
    } else {
      // Admin de empresa deve ser gerenciado via user_empresa
      // Esta função não deve ser usada para admin de empresa
      console.warn('setAdminStatusById called for regular admin. Use user_empresa.is_admin instead.');
      throw new Error('Regular admin status should be managed via user_empresa table, not profiles');
    }
  } catch (error: any) {
    console.error('Error setting admin status:', error);
    throw error;
  }
};

/**
 * Make a user admin by updating their profile
 */
export const makeUserAdmin = async (targetEmail: string): Promise<boolean> => {
  try {
    console.log(`Attempting to make ${targetEmail} a super admin...`);
    
    // Buscar por email primeiro (campo correto)
    const { data: profileByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('email', targetEmail)
      .limit(1);
    
    if (!emailError && profileByEmail && profileByEmail.length > 0) {
      console.log(`Found user by email: ${profileByEmail[0].id}`);
      return await setAdminStatusById(profileByEmail[0].id, true, true); // isSuperAdmin = true
    }
    
    // First try to find by email-like display_name (exact match)
    const { data: exactProfiles, error: exactError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('display_name', targetEmail)
      .limit(1);
    
    if (!exactError && exactProfiles && exactProfiles.length > 0) {
      console.log(`Found user by exact display_name: ${exactProfiles[0].id}`);
      return await setAdminStatusById(exactProfiles[0].id, true, true); // isSuperAdmin = true
    }
    
    // Try to find by display_name that might match the email username part
    const displayName = targetEmail.split('@')[0];
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .ilike('display_name', `%${displayName}%`)
      .limit(5);
    
    if (error) {
      console.error('Error finding profiles by display_name:', error);
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      throw new Error(`No user found matching ${targetEmail}`);
    }
    
    // If multiple matches, take the first one
    const userId = profiles[0].id;
    console.log(`Found user by partial display_name match: ${userId} (${profiles[0].display_name})`);
    return await setAdminStatusById(userId, true, true); // isSuperAdmin = true
    
  } catch (error: any) {
    console.error('Error in makeUserAdmin function:', error);
    throw error;
  }
};
