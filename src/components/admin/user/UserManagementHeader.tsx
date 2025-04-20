
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";

interface UserManagementHeaderProps {
  onAddAdminClick: () => void;
  onRefreshClick: () => void;
  loading: boolean;
  isRefreshing: boolean;
  isSuperAdmin: boolean;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onAddAdminClick,
  onRefreshClick,
  loading,
  isRefreshing,
  isSuperAdmin
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isSuperAdmin 
            ? "Gerencie todos os usuários da plataforma"
            : "Gerencie os usuários das suas empresas"}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshClick}
          disabled={loading || isRefreshing}
        >
          <RefreshCw 
            className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
          Atualizar
        </Button>
        
        {isSuperAdmin && (
          <Button size="sm" onClick={onAddAdminClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Admin
          </Button>
        )}
      </div>
    </div>
  );
};
