
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, UserMinus } from "lucide-react";

interface User {
  id: string;
  display_name: string;
  cargo_id: string | null;
}

interface AssignedUsersListProps {
  users: User[];
  onRemoveUser: (userId: string) => void;
}

export const AssignedUsersList: React.FC<AssignedUsersListProps> = ({
  users,
  onRemoveUser
}) => {
  if (users.length === 0) {
    return (
      <div className="p-4 text-center bg-gray-50 dark:bg-gray-900 rounded-md">
        <p className="text-sm text-gray-500">
          Nenhum usuário possui este cargo
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="max-h-80 overflow-y-auto">
        <ul className="divide-y">
          {users.map(user => (
            <li key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>{user.display_name}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-500 hover:text-red-700"
                onClick={() => onRemoveUser(user.id)}
              >
                <UserMinus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Remover</span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
