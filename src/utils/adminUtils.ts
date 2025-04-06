
import { supabase } from "@/integrations/supabase/client";

// Define a clear interface for Supabase users to avoid type issues
interface SupabaseUser {
  id: string;
  email?: string | null;
}

export const makeUserAdmin = async (targetEmail: string) => {
  try {
    console.log(`Attempting to make ${targetEmail} an admin...`);
    
    // First try to get the user directly from profiles based on email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('email', targetEmail)
      .maybeSingle();
    
    let userId;
    
    // If we couldn't find by email in profiles, try auth.users
    if (profileError || !profileData) {
      console.log('User not found in profiles by email, trying auth.users...');
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching users:', authError);
        throw authError;
      }
      
      if (!authData || !Array.isArray(authData.users)) {
        console.error('Invalid response format from listUsers');
        throw new Error('Invalid response format from listUsers');
      }
      
      const users = authData.users as SupabaseUser[];
      const targetUser = users.find(u => u.email === targetEmail);
      
      if (!targetUser) {
        console.error(`User with email ${targetEmail} not found`);
        throw new Error(`User with email ${targetEmail} not found`);
      }
      
      userId = targetUser.id;
    } else {
      userId = profileData.id;
      
      // If user is already admin, just return
      if (profileData.is_admin) {
        console.log(`${targetEmail} is already an admin.`);
        return true;
      }
    }
    
    console.log(`Found user ID: ${userId}, updating admin status...`);
    
    // Make the user an admin
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

// Function to directly set admin status by user ID
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
