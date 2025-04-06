
import { supabase } from "@/integrations/supabase/client";

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

/**
 * Make a user admin by updating their profile
 */
export const makeUserAdmin = async (targetEmail: string): Promise<boolean> => {
  try {
    console.log(`Attempting to make ${targetEmail} an admin...`);
    
    // First try to find the user by display_name that might match the email
    const displayName = targetEmail.split('@')[0];
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', `%${displayName}%`);
    
    if (error) {
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      throw new Error(`No user found matching ${targetEmail}`);
    }
    
    // If multiple matches, take the first one
    const userId = profiles[0].id;
    return await setAdminStatusById(userId, true);
    
  } catch (error: any) {
    console.error('Error in makeUserAdmin function:', error);
    throw error;
  }
};
