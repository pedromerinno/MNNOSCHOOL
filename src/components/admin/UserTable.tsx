
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
import { Skeleton } from "@/components/ui/skeleton";

interface UserTableProps {
  users: UserProfile[];
  loading: boolean;
  onToggle: (userId: string, currentStatus: boolean | null, isSuperAdmin: boolean) => Promise<void>;
  isSuperAdmin: boolean; // Adicionada a propriedade que faltava
}

export const UserTable: React.FC<UserTableProps> = ({ users, loading, onToggle, isSuperAdmin }) => {
  const getBadgeContent = (user: UserProfile) => {
    if (user.super_admin) {
      return (
        <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 text-white">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Super Admin
        </Badge>
      );
    }
    if (user.is_admin) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700">
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Usuário
      </Badge>
    );
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-900">
            <TableHead className="font-medium text-gray-600 dark:text-gray-300">Nome</TableHead>
            <TableHead className="font-medium text-gray-600 dark:text-gray-300">Email</TableHead>
            <TableHead className="font-medium text-gray-600 dark:text-gray-300">Status</TableHead>
            <TableHead className="text-right font-medium text-gray-600 dark:text-gray-300">Ações</TableHead>
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
              <TableRow key={user.id} className={`${loading ? "opacity-60" : ""} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                  {loading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : (
                    user.display_name
                  )}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {loading ? (
                    <Skeleton className="h-5 w-36" />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>
                  {loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    getBadgeContent(user)
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {loading ? (
                    <Skeleton className="h-8 w-20 ml-auto" />
                  ) : (
                    <UserAdminToggle 
                      userId={user.id} 
                      isAdmin={user.is_admin} 
                      isSuperAdmin={user.super_admin}
                      onToggle={onToggle}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
