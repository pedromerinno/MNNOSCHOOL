import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, BadgeX, Briefcase, UserX, FileText } from "lucide-react";
import { UserProfile } from "@/hooks/useUsers";
interface CollaboratorsListProps {
  users: UserProfile[];
  userRoles: Record<string, string>;
  onManageRole: (user: UserProfile) => void;
  onManageDocuments: (user: UserProfile) => void;
  onRemoveUser: (userId: string) => void;
}
export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  users,
  userRoles,
  onManageRole,
  onManageDocuments,
  onRemoveUser
}) => {
  console.log('CollaboratorsList rendering with users:', users.length);
  return <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                Nenhum colaborador encontrado
              </TableCell>
            </TableRow> : users.map(user => <TableRow key={user.id}>
                <TableCell className="py-[30px]">{user.display_name || "Sem nome"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.id && userRoles[user.id] ? <>
                        <BadgeCheck className="h-4 w-4 text-green-500" />
                        <span>{userRoles[user.id]}</span>
                      </> : <>
                        <BadgeX className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">Sem cargo</span>
                      </>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onManageRole(user)} className="py-[20px]">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Gerenciar Cargo
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onManageDocuments(user)} className="py-[20px]">
                      <FileText className="h-4 w-4 mr-2" />
                      Documentos
                    </Button>
                    {user.id && <Button variant="outline" size="sm" onClick={() => onRemoveUser(user.id || '')} className="text-red-500 hover:text-red-700 hover:bg-red-50 py-[20px]">
                        <UserX className="h-4 w-4 mr-2" />
                        Remover
                      </Button>}
                  </div>
                </TableCell>
              </TableRow>)}
        </TableBody>
      </Table>
    </Card>;
};