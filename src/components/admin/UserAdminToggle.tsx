
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";

interface UserAdminToggleProps {
  userId: string;
  isAdmin: boolean | null;
  onToggle: (userId: string, currentStatus: boolean | null) => Promise<void>;
}

export const UserAdminToggle: React.FC<UserAdminToggleProps> = ({ 
  userId, 
  isAdmin, 
  onToggle 
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onToggle(userId, isAdmin)}
    >
      <UserCog className="h-4 w-4 mr-1" />
      {isAdmin ? "Remover Admin" : "Tornar Admin"}
    </Button>
  );
};
