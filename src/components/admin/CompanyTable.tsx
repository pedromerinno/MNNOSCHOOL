import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  return <div className="rounded-xl border overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <Table className="py-0 px-0">
        <TableHeader className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableHead className="w-16 font-semibold text-gray-700 dark:text-gray-300 px-[20px] py-[20px]">Logo</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-[20px] py-[20px]">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell px-[20px] py-[20px]">Frase Institucional</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Data de Criação</TableHead>
            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 && !loading ? <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhuma empresa encontrada
              </TableCell>
            </TableRow> : companies.map(company => <TableRow key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <TableCell className="p-3 py-[30px] px-[30px]">
                  {company.logo ? <div className="h-12 w-12 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden">
                      <img src={company.logo} alt={`${company.nome} logo`} className="h-10 w-10 object-contain" onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                target.onerror = null;
              }} />
                    </div> : <div className="h-12 w-12 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <img src="/placeholder.svg" alt="Placeholder logo" className="h-8 w-8 object-contain opacity-50" />
                    </div>}
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">{company.nome}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 hidden md:table-cell">
                  {company.frase_institucional && company.frase_institucional.length > 60 ? `${company.frase_institucional.substring(0, 60)}...` : company.frase_institucional || '-'}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 hidden md:table-cell">
                  {new Date(company.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onManageUsers(company)} className="h-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Usuários</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(company)} className="h-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Pencil className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(company.id)} className="h-9">
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>)}
        </TableBody>
      </Table>
    </div>;
};