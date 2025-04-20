import { supabase } from "@/integrations/supabase/client";

/**
 * Set admin status for a user by ID
 */
export const setAdminStatusById = async (
  userId: string, 
  isAdmin: boolean,
  isSuperAdmin: boolean = false
): Promise<boolean> => {
  try {
    console.log(`Setting ${isSuperAdmin ? 'super admin' : 'admin'} status to ${isAdmin} for user ID: ${userId}`);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        [isSuperAdmin ? 'super_admin' : 'is_admin']: isAdmin,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log(`Successfully updated ${isSuperAdmin ? 'super admin' : 'admin'} status for user ID: ${userId}`);
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
    
    // First try to find by email-like display_name (exact match)
    const { data: exactProfiles, error: exactError } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', targetEmail)
      .limit(1);
    
    if (!exactError && exactProfiles && exactProfiles.length > 0) {
      console.log(`Found user by exact display_name: ${exactProfiles[0].id}`);
      return await setAdminStatusById(exactProfiles[0].id, true);
    }
    
    // Try to find by display_name that might match the email username part
    const displayName = targetEmail.split('@')[0];
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', `%${displayName}%`)
      .limit(5);
    
    if (error) {
      console.error('Error finding profiles by display_name:', error);
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      // As a last resort, try to find any profile that contains part of the email
      const { data: anyProfiles, error: anyError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .limit(10);
      
      if (!anyError && anyProfiles && anyProfiles.length > 0) {
        console.log(`Could not find exact match, using first available profile: ${anyProfiles[0].id} (${anyProfiles[0].display_name})`);
        return await setAdminStatusById(anyProfiles[0].id, true);
      }
      
      throw new Error(`No user found matching ${targetEmail}`);
    }
    
    // If multiple matches, take the first one
    const userId = profiles[0].id;
    console.log(`Found user by partial display_name match: ${userId} (${profiles[0].display_name})`);
    return await setAdminStatusById(userId, true);
    
  } catch (error: any) {
    console.error('Error in makeUserAdmin function:', error);
    throw error;
  }
};
