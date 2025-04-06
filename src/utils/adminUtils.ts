
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const makeUserAdmin = async (targetEmail: string) => {
  const toast = useToast();
  
  try {
    // Get the targetEmail user data
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Ensure the data object and users array exist
    if (!data || !Array.isArray(data.users)) {
      throw new Error('Invalid response format from listUsers');
    }
    
    const targetUser = data.users.find(u => u.email === targetEmail);
    
    if (!targetUser) {
      throw new Error(`User with email ${targetEmail} not found`);
    }
    
    // Make the user an admin if they're not already
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUser.id);
    
    if (updateError) throw updateError;
    
    toast.toast({
      title: 'Sucesso',
      description: `${targetEmail} agora é um administrador.`
    });
    
    return true;
  } catch (error: any) {
    console.error('Error making user admin:', error);
    toast.toast({
      title: 'Erro',
      description: error.message,
      variant: 'destructive',
    });
    return false;
  }
};
