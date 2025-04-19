
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobRole } from "@/types/job-roles";
import { UserProfile } from "@/hooks/useUsers";

interface RoleUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: JobRole;
  companyId: string;
}

export const RoleUsersDialog: React.FC<RoleUsersDialogProps> = ({
  open,
  onOpenChange,
  role,
  companyId
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both users with this role and available users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar usuários da empresa
      const { data: companyUsers, error: companyError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', companyId);

      if (companyError) throw companyError;

      const userIds = companyUsers.map(u => u.user_id);

      // Buscar perfis dos usuários que já têm este cargo
      const { data: roleUsers, error: roleError } = await supabase
        .from('profiles')
        .select('*')
        .eq('cargo_id', role.id);

      if (roleError) throw roleError;

      // Buscar perfis dos usuários disponíveis (que não têm este cargo)
      const { data: otherUsers, error: otherError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .is('cargo_id', null);

      if (otherError) throw otherError;

      setUsers(roleUsers || []);
      setAvailableUsers(otherUsers || []);

    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast.error(`Erro ao carregar usuários: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, companyId, role.id]);

  const assignUserRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          cargo_id: role.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Cargo atribuído com sucesso');
      fetchUsers();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error(`Erro ao atribuir cargo: ${error.message}`);
    }
  };

  const removeUserRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          cargo_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Cargo removido com sucesso');
      fetchUsers();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(`Erro ao remover cargo: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Usuários do Cargo</DialogTitle>
          <DialogDescription>
            Atribua ou remova usuários do cargo: {role.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Usuários com este cargo */}
              <div>
                <h4 className="text-sm font-medium mb-3">Usuários com este cargo</h4>
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum usuário atribuído a este cargo</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">{user.display_name || user.email}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeUserRole(user.id!)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Usuários disponíveis */}
              <div>
                <h4 className="text-sm font-medium mb-3">Usuários disponíveis</h4>
                {filteredAvailableUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum usuário disponível</p>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailableUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">{user.display_name || user.email}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => assignUserRole(user.id!)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
