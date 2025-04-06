
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { UserAdminToggle } from "./UserAdminToggle";
import { UserProfile } from "@/hooks/useUsers";

interface UserTableProps {
  users: UserProfile[];
  loading: boolean;
  onToggleAdmin: (userId: string, currentStatus: boolean | null) => Promise<void>;
}

export const UserTable: React.FC<UserTableProps> = ({ users, loading, onToggleAdmin }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.display_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Usuário
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <UserAdminToggle 
                    userId={user.id} 
                    isAdmin={user.is_admin} 
                    onToggle={onToggleAdmin} 
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
