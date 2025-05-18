
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MakeAdminButton = () => {
  const { userProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Skip rendering if already admin or super_admin
  if (userProfile?.is_admin || userProfile?.super_admin) {
    return null;
  }
  
  const makeUserAdmin = async () => {
    if (!userProfile?.id) {
      toast.error("Perfil de usuário não encontrado");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);
        
      if (error) throw error;
      
      toast.success("Você agora é um administrador!");
      
      // Refresh the page to update the user's profile
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao tornar usuário admin:", error);
      toast.error("Falha ao atualizar permissões", {
        description: error.message || "Ocorreu um erro ao atualizar suas permissões."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button 
      onClick={makeUserAdmin}
      disabled={isProcessing}
      variant="outline"
      size="sm"
    >
      {isProcessing ? "Processando..." : "Tornar-se Admin"}
    </Button>
  );
};
