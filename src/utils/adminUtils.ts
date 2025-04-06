
import { supabase } from "@/integrations/supabase/client";

// Simple interface to avoid deep type instantiation
type AdminUserProfile = {
  id: string;
  email: string | null;
  is_admin: boolean | null;
};

/**
 * Make a user admin by email address
 */
export const makeUserAdmin = async (targetEmail: string): Promise<boolean> => {
  try {
    console.log(`Attempting to make ${targetEmail} an admin...`);
    
    // First get the user's id from auth
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    // Using 'any' to avoid deep type issues
    const users = data.users as any[];
    
    const targetUser = users.find(u => u.email === targetEmail);
    
    if (!targetUser) {
      console.error(`User with email ${targetEmail} not found`);
      throw new Error(`User with email ${targetEmail} not found`);
    }
    
    return await setAdminStatusById(targetUser.id, true);
  } catch (error: any) {
    console.error('Error in makeUserAdmin function:', error);
    throw error;
  }
};

/**
 * Set admin status for a user by ID
 */
export const setAdminStatusById = async (userId: string, isAdmin: boolean): Promise<boolean> => {
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
