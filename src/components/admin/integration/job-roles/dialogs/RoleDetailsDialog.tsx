
import React from 'react';
import { JobRole } from "@/types/job-roles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface RoleDetailsDialogProps {
  role: JobRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedUsers: { id: string; display_name: string }[];
}

export const RoleDetailsDialog = ({
  role,
  open,
  onOpenChange,
  assignedUsers
}: RoleDetailsDialogProps) => {
  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{role.title}</DialogTitle>
          <DialogDescription>
            Detalhes do cargo e usuários associados
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {role.description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Descrição</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {role.description}
              </p>
            </div>
          )}

          {role.responsibilities && (
            <div>
              <h4 className="text-sm font-medium mb-1">Responsabilidades</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {role.responsibilities}
              </p>
            </div>
          )}

          {role.requirements && (
            <div>
              <h4 className="text-sm font-medium mb-1">Requisitos</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {role.requirements}
              </p>
            </div>
          )}

          {role.expectations && (
            <div>
              <h4 className="text-sm font-medium mb-1">Expectativas</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {role.expectations}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Usuários com este cargo</h4>
            {assignedUsers.length > 0 ? (
              <ul className="space-y-1">
                {assignedUsers.map(user => (
                  <li key={user.id} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{user.display_name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhum usuário está associado a este cargo
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
