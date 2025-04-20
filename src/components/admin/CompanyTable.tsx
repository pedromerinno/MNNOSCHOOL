
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users } from "lucide-react";
import { Company } from "@/types/company";

interface CompanyTableProps {
  companies: Company[];
  loading: boolean;
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
  onManageUsers: (company: Company) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({ 
  companies, 
  loading, 
  onEdit,
  onDelete,
  onManageUsers
}) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Logo</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Frase Institucional</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Nenhuma empresa encontrada
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="p-1">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={`${company.nome} logo`} 
                      className="h-10 w-10 rounded object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <img 
                      src="/placeholder.svg" 
                      alt="Placeholder logo" 
                      className="h-10 w-10 rounded object-contain"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{company.nome}</TableCell>
                <TableCell>{company.frase_institucional || '-'}</TableCell>
                <TableCell>{new Date(company.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onManageUsers(company)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Usuários
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(company)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onDelete(company.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

