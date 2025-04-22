
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRoleAssignment } from '../UserRoleAssignment';

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  companyId: string;
  onSuccess: () => void;
}

export const RoleManagementDialog: React.FC<RoleManagementDialogProps> = ({
  open,
  onOpenChange,
  user,
  companyId,
  onSuccess
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Cargo</DialogTitle>
          <DialogDescription>
            Atribua um cargo ao colaborador
          </DialogDescription>
        </DialogHeader>
        
        {user && companyId && (
          <UserRoleAssignment 
            user={user}
            companyId={companyId}
            onSuccess={() => {
              // Dispatch event for other components to refresh
              window.dispatchEvent(new Event('user-role-updated'));
              onSuccess();
            }}
          />
        )}
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
