
import { supabase } from "@/integrations/supabase/client";

// Define a simplified interface for Supabase users
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
      
      // Using any to avoid the deep instantiation error
      const result: any = await supabase.auth.admin.listUsers();
      
      if (result.error) {
        console.error('Error fetching users:', result.error);
        throw result.error;
      }
      
      if (!result.data || !result.data.users) {
        console.error('Invalid response format from listUsers');
        throw new Error('Invalid response format from listUsers');
      }
      
      // Create a simplified array with just what we need
      const users: SupabaseUser[] = [];
      
      for (const user of result.data.users) {
        users.push({
          id: user.id,
          email: user.email
        });
      }
      
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

// Function for toggling admin status directly by ID
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
