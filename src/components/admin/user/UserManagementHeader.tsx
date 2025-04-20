
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from 'lucide-react';

interface UserManagementHeaderProps {
  onAddAdminClick: () => void;
  onRefreshClick: () => void;
  loading: boolean;
  isRefreshing: boolean;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onAddAdminClick,
  onRefreshClick,
  loading,
  isRefreshing
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onAddAdminClick} 
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Adicionar Admin
        </Button>
        <Button 
          onClick={onRefreshClick} 
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
  );
};
