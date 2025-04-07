
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { makeUserAdmin } from '@/utils/adminUtils';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw, UserPlus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const { toast } = useToast();
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initial fetch of users
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Try to make an initial admin when the component mounts
  useEffect(() => {
    const setInitialAdmin = async () => {
      if (initialSetupDone) return;
      
      try {
        console.log("Attempting to set initial admin...");
        const targetEmail = 'pedro@merinno.com';
        
        // Try to find if user already exists and is admin
        const existingAdmin = users.find(user => 
          user.is_admin
        );
        
        if (existingAdmin) {
          console.log("Initial admin is already set up");
          setInitialSetupDone(true);
          return;
        }
        
        // Try to make the user an admin
        await makeUserAdmin(targetEmail);
        toast({
          title: 'Sucesso',
          description: `${targetEmail} agora é um administrador.`,
        });
        setInitialSetupDone(true);
        fetchUsers(); // Refresh the list
      } catch (error: any) {
        console.error('Error in initial admin setup:', error);
        
        // Check if this is a permission error
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
    
    // Only run setup if users are loaded and setup hasn't been done yet
    if (users.length > 0 && !initialSetupDone) {
      setInitialAdmin();
    }
  }, [users, initialSetupDone, toast, fetchUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchUsers();
      setPermissionError(false);
    } catch (error: any) {
      console.error('Error refreshing users:', error);
      // If we get an error, check if it's a permission error
      if (error?.message?.includes('permission') || error?.status === 403) {
        setPermissionError(true);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminEmail.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe um email válido',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingAdmin(true);
    try {
      await makeUserAdmin(adminEmail);
      toast({
        title: 'Sucesso',
        description: `${adminEmail} agora é um administrador.`,
      });
      setAdminEmail('');
      setIsDialogOpen(false);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error making user admin:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao configurar o administrador',
        variant: 'destructive',
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Admin
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={loading || isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {(loading || isRefreshing) ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>
      
      {permissionError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4 flex items-start dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Aviso de Permissão</p>
            <p className="text-sm">Você está visualizando os perfis de usuário, mas não tem acesso administrativo completo. Algumas informações, como emails reais, não estão disponíveis.</p>
          </div>
        </div>
      )}
      
      {loading && users.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <UserTable 
          users={users} 
          loading={loading} 
          onToggleAdmin={toggleAdminStatus} 
        />
      )}

      {/* Dialog para adicionar administrador */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Administrador</DialogTitle>
            <DialogDescription>
              Digite o email ou nome de usuário da pessoa que você deseja tornar administrador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Email ou nome de usuário"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleAddAdmin} 
              disabled={isAddingAdmin || !adminEmail.trim()}
              className="gap-2"
            >
              {isAddingAdmin ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Adicionar Administrador
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
