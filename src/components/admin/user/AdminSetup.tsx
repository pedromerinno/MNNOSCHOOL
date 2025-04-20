
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { makeUserAdmin } from '@/utils/adminUtils';
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from '@/hooks/useUsers';

interface AdminSetupProps {
  users: UserProfile[];
  initialSetupDone: boolean;
  setInitialSetupDone: (done: boolean) => void;
  setPermissionError: (error: boolean) => void;
  fetchUsers: () => void;
}

export const AdminSetup: React.FC<AdminSetupProps> = ({
  users,
  initialSetupDone,
  setInitialSetupDone,
  setPermissionError,
  fetchUsers
}) => {
  const { toast } = useToast();

  React.useEffect(() => {
    const setInitialAdmin = async () => {
      if (initialSetupDone) return;
      
      try {
        console.log("Attempting to set initial admin...");
        const targetEmail = 'pedro@merinno.com';
        
        const existingAdmin = users.find(user => user.is_admin);
        
        if (existingAdmin) {
          console.log("Initial admin is already set up");
          setInitialSetupDone(true);
          return;
        }
        
        await makeUserAdmin(targetEmail);
        toast({
          title: 'Sucesso',
          description: `${targetEmail} agora é um administrador.`,
        });
        setInitialSetupDone(true);
        fetchUsers();
      } catch (error: any) {
        console.error('Error in initial admin setup:', error);
        
        if (error.message?.includes('permission') || error.status === 403) {
          setPermissionError(true);
        }
        
        toast({
          title: 'Aviso',
          description: `Configuração de administrador inicial não concluída. Você pode adicionar um administrador manualmente.`,
          variant: 'default',
        });
      }
    };
    
    if (users.length > 0 && !initialSetupDone) {
      setInitialAdmin();
    }
  }, [users, initialSetupDone, toast, fetchUsers, setInitialSetupDone, setPermissionError]);

  return null;
};
