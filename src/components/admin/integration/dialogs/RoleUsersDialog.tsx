
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoleUsersDialogProps {
  roleId: string;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoleUsersDialog: React.FC<RoleUsersDialogProps> = ({
  roleId,
  companyId,
  open,
  onOpenChange
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && roleId) {
      fetchUsersWithRole();
    }
  }, [open, roleId]);

  const fetchUsersWithRole = async () => {
    setLoading(true);
    try {
      // Query to get users who have this role assigned
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email')
        .eq('cargo_id', roleId);

      if (error) throw error;

      // Set the users
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users with role:", error);
      toast.error(`Erro ao buscar usuários: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Usuários com este Cargo</DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          {loading ? (
            <div className="py-4 text-center">
              <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Nenhum usuário atribuído a este cargo
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="p-3 border rounded-md flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.display_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                        {user.display_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.display_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleUsersDialog;
