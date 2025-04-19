
import React from 'react';
import { JobRole } from "@/types/job-roles";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Info, Users, Edit, Trash2 } from "lucide-react";

interface JobRolesListProps {
  jobRoles: JobRole[];
  onMoveRole: (roleId: string, direction: 'up' | 'down') => void;
  onShowDetails: (role: JobRole) => void;
  onManageUsers: (role: JobRole) => void;
  onEditRole: (role: JobRole) => void;
  onDeleteRole: (roleId: string) => void;
}

export const JobRolesList = ({
  jobRoles,
  onMoveRole,
  onShowDetails,
  onManageUsers,
  onEditRole,
  onDeleteRole
}: JobRolesListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Ordem</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobRoles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="text-center">
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveRole(role.id, 'up')}
                  disabled={role.order_index === 0}
                  className="h-6 w-6"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span>{role.order_index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveRole(role.id, 'down')}
                  disabled={role.order_index === jobRoles.length - 1}
                  className="h-6 w-6"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <p className="font-medium">{role.title}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {role.description || "Sem descrição"}
              </p>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onShowDetails(role)}
                  title="Ver detalhes"
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onManageUsers(role)}
                  title="Gerenciar usuários"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditRole(role)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteRole(role.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
