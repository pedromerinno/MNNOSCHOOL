import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Image } from "lucide-react";
import { UserAdminToggle } from "./UserAdminToggle";
import { UserProfile } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";

// Novo type: Supondo companies?: { logo: string | null, nome: string }[] em UserProfile
type ExtendedUserProfile = UserProfile & {
  companies?: {
    logo: string | null;
    nome: string;
  }[];
};
interface UserTableProps {
  users: ExtendedUserProfile[];
  loading: boolean;
  onToggle: (userId: string, currentStatus: boolean | null, isSuperAdmin: boolean) => Promise<void>;
}
const CompanyLogosCell: React.FC<{
  companies?: {
    logo: string | null;
    nome: string;
  }[];
}> = ({
  companies
}) => {
  if (!companies || companies.length === 0) return <span className="text-xs text-gray-400">Nenhuma</span>;
  const maxToShow = 3;
  const showCompanies = companies.slice(0, maxToShow);
  const extra = companies.length - maxToShow;
  return <div className="flex items-center gap-1.5">
      {showCompanies.map((company, idx) => company.logo ? <img key={company.nome + idx} src={company.logo} alt={company.nome} className="w-8 h-8 rounded-md object-contain border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-0.5" /> : <span key={company.nome + idx} className="rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center w-8 h-8 border border-gray-200 dark:border-gray-700">
            <Image className="w-4 h-4" />
          </span>)}
      {extra > 0 && <span className="ml-1.5 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">+{extra}</span>}
    </div>;
};
export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onToggle
}) => {
  const getBadgeContent = (user: ExtendedUserProfile) => {
    if (user.super_admin) {
      return <Badge variant="default" className="text-white py-[7px] bg-sky-500">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Super Admin
        </Badge>;
    }
    if (user.is_admin) {
      return <Badge variant="default" className="text-white bg-[#e0a93c] py-[7px]">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Admin
        </Badge>;
    }
    return <Badge variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700">
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Usuário
      </Badge>;
  };
  return <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Email</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Empresas</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
            <TableHead className="text-right font-semibold px-[30px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && !loading ? <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow> : users.map(user => <TableRow key={user.id} className={`${loading ? "opacity-60" : ""} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
                <TableCell className="py-[30px] px-[30px]">
                  {loading ? <Skeleton className="h-5 w-24" /> : user.display_name}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {loading ? <Skeleton className="h-5 w-36" /> : user.email}
                </TableCell>
                <TableCell>
                  {loading ? <Skeleton className="h-8 w-28" /> : <CompanyLogosCell companies={user.companies} />}
                </TableCell>
                <TableCell>
                  {loading ? <Skeleton className="h-6 w-16" /> : getBadgeContent(user)}
                </TableCell>
                <TableCell className="text-right">
                  {loading ? <Skeleton className="h-8 w-20 ml-auto" /> : <UserAdminToggle userId={user.id} isAdmin={user.is_admin} isSuperAdmin={user.super_admin} onToggle={onToggle} />}
                </TableCell>
              </TableRow>)}
        </TableBody>
      </Table>
    </div>;
};