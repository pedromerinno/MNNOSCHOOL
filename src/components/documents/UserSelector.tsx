
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { CompanyUser } from "@/hooks/company-documents/useCompanyUsers";

interface UserSelectorProps {
  users: CompanyUser[];
  selectedUsers: string[];
  onUserToggle: (userId: string, checked: boolean) => void;
  isPublic: boolean;
  companyColor: string;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUsers,
  onUserToggle,
  isPublic,
  companyColor
}) => {
  if (isPublic || users.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" style={{ color: companyColor }} />
        <Label className="text-sm font-medium">Usuários com acesso:</Label>
      </div>
      
      <ScrollArea className="h-48 border rounded-md p-3">
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-start space-x-3">
              <Checkbox
                id={`user-${user.id}`}
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={(checked) => onUserToggle(user.id, checked === true)}
              />
              <div className="flex-1 min-w-0">
                <Label 
                  htmlFor={`user-${user.id}`} 
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <User className="h-3 w-3" />
                  {user.display_name}
                </Label>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {user.job_role && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {user.job_role.title}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {selectedUsers.length === 0 && (
        <p className="text-sm text-orange-600 flex items-center gap-1">
          <Users className="h-3 w-3" />
          Selecione pelo menos um usuário ou marque como público
        </p>
      )}
    </div>
  );
};
