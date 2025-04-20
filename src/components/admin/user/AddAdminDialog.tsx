
import React from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { makeUserAdmin } from '@/utils/adminUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface AddAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fetchUsers: () => void;
}

export const AddAdminDialog: React.FC<AddAdminDialogProps> = ({
  isOpen,
  onOpenChange,
  fetchUsers
}) => {
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

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
      onOpenChange(false);
      fetchUsers();
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
};
