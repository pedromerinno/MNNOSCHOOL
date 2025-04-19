
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";

interface User {
  id: string;
  display_name: string;
  cargo_id: string | null;
}

interface UnassignedUsersListProps {
  users: User[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAssignUser: (userId: string) => void;
}

export const UnassignedUsersList: React.FC<UnassignedUsersListProps> = ({
  users,
  searchQuery,
  onSearchChange,
  onAssignUser
}) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar usuários..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {users.length === 0 ? (
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-900 rounded-md">
          <p className="text-sm text-gray-500">
            {searchQuery 
              ? "Nenhum usuário encontrado com essa busca" 
              : "Nenhum usuário disponível"
            }
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-72 overflow-y-auto">
            <ul className="divide-y">
              {users.map(user => (
                <li key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span>{user.display_name}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => onAssignUser(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
