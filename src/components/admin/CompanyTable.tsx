
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Users, Building } from "lucide-react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/stringUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { userProfile } = useAuth();
  const [deletableCompanies, setDeletableCompanies] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const checkDeletableCompanies = async () => {
      // If user is a super admin, they can delete all companies
      if (userProfile?.super_admin) {
        const allDeletable = companies.reduce((acc, company) => {
          acc[company.id] = true;
          return acc;
        }, {} as Record<string, boolean>);
        
        setDeletableCompanies(allDeletable);
        return;
      }
      
      // Otherwise, check which companies the user can delete
      const deletableMap: Record<string, boolean> = {};
      
      for (const company of companies) {
        const { data, error } = await supabase
          .from('empresas')
          .select('created_by')
          .eq('id', company.id)
          .single();
          
        deletableMap[company.id] = !error && data && data.created_by === userProfile?.id;
      }
      
      setDeletableCompanies(deletableMap);
    };
    
    if (companies.length > 0 && userProfile) {
      checkDeletableCompanies();
    }
  }, [companies, userProfile]);

  return <div className="rounded-xl border overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableHead className="w-16 font-semibold text-gray-700 dark:text-gray-300">Logo</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Frase Institucional</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Data de Criação</TableHead>
            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 w-20">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center justify-center">
                  <Building className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium mb-1">Nenhuma empresa encontrada</p>
                  <p className="text-sm text-muted-foreground">
                    Comece criando uma nova empresa
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : companies.map(company => <TableRow key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <TableCell className="p-3 px-[20px] py-[20px]">
                  {company.logo ? (
                    <div className="h-12 w-12 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden">
                      <img 
                        src={company.logo} 
                        alt={`${company.nome} logo`} 
                        className="h-full w-full object-cover" 
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show initials fallback
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-xl font-semibold text-primary">${getInitials(company.nome)}</span>`;
                            parent.className = "h-12 w-12 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-primary/10";
                          }
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-primary/10">
                      <span className="text-xl font-semibold text-primary">
                        {getInitials(company.nome)}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">{company.nome}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 hidden md:table-cell">
                  {company.frase_institucional && company.frase_institucional.length > 60 ? `${company.frase_institucional.substring(0, 60)}...` : company.frase_institucional || '-'}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 hidden md:table-cell">
                  {new Date(company.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right p-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => onManageUsers(company)}
                      >
                        <Users className="h-4 w-4" />
                        <span>Usuários</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => onEdit(company)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      {(userProfile?.super_admin || deletableCompanies[company.id]) && (
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400"
                          onClick={() => onDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>)}
        </TableBody>
      </Table>
    </div>;
};
