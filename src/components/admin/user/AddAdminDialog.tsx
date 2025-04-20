import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { makeUserAdmin } from '@/utils/adminUtils';
import { toast } from "sonner";

interface AddAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fetchUsers: () => void;
}

export const AddAdminDialog: React.FC<AddAdminDialogProps> = ({ isOpen, onOpenChange, fetchUsers }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await makeUserAdmin(email);
      toast.success(`${email} agora é um administrador.`);
      onOpenChange(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao adicionar administrador:', error);
      toast.error(error.message || 'Falha ao adicionar administrador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Administrador</DialogTitle>
          <DialogDescription>
            Atribua privilégios de administrador a um usuário existente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              type="email"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
