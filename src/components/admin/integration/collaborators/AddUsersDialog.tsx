
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, X, Users, UserPlus, Loader2 } from "lucide-react";

interface AddUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableUsers: any[];
  loadingUsers: boolean;
  onAddUser: (userId: string) => void;
}

export const AddUsersDialog: React.FC<AddUsersDialogProps> = ({
  open,
  onOpenChange,
  searchTerm,
  onSearchChange,
  availableUsers,
  loadingUsers,
  onAddUser
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Colaboradores</DialogTitle>
          <DialogDescription>
            Selecione usuários para adicionar à empresa
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {loadingUsers ? (
          <div className="h-72 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : availableUsers.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm 
                ? "Nenhum usuário corresponde à sua busca" 
                : "Não há mais usuários disponíveis para adicionar"}
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.display_name || "Sem nome"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddUser(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
