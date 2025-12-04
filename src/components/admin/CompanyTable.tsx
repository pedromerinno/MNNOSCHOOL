
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Users, Building, Calendar } from "lucide-react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/stringUtils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminTable, AdminTableColumn, SortField, SortDirection } from "./AdminTable";

interface CompanyTableProps {
  companies: Company[];
  loading: boolean;
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
  onManageUsers: (company: Company) => void;
}

interface CompanyWithUsers extends Company {
  users_count?: number;
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
  const [companiesWithUsers, setCompaniesWithUsers] = useState<CompanyWithUsers[]>([]);
  const [usersCountLoading, setUsersCountLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Handle sort changes
  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Fetch user counts for each company
  useEffect(() => {
    const fetchUserCounts = async () => {
      if (companies.length === 0) {
        setCompaniesWithUsers([]);
        return;
      }

      setUsersCountLoading(true);
      try {
        const companyIds = companies.map(c => c.id);
        
        // Fetch user counts for all companies in one query
        const { data: userCounts, error } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .in('empresa_id', companyIds);

        if (error) throw error;

        // Count users per company
        const countMap: Record<string, number> = {};
        userCounts?.forEach(item => {
          countMap[item.empresa_id] = (countMap[item.empresa_id] || 0) + 1;
        });

        // Add user counts to companies
        const companiesWithCounts: CompanyWithUsers[] = companies.map(company => ({
          ...company,
          users_count: countMap[company.id] || 0
        }));

        setCompaniesWithUsers(companiesWithCounts);
      } catch (error) {
        console.error('Error fetching user counts:', error);
        // Fallback to companies without user counts
        setCompaniesWithUsers(companies.map(c => ({ ...c, users_count: 0 })));
      } finally {
        setUsersCountLoading(false);
      }
    };

    fetchUserCounts();
  }, [companies]);

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

  // Sort companies
  const sortedCompanies = useMemo(() => {
    if (companiesWithUsers.length === 0) return [];
    
    const sorted = [...companiesWithUsers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'nome':
          aValue = a.nome?.toLowerCase() || '';
          bValue = b.nome?.toLowerCase() || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        case 'users_count':
          aValue = a.users_count || 0;
          bValue = b.users_count || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [companiesWithUsers, sortField, sortDirection]);

  // Render company logo
  const renderLogo = (company: CompanyWithUsers) => {
    if (company.logo) {
      return (
        <div className="h-14 w-14 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
          <img 
            src={company.logo} 
            alt={`${company.nome} logo`} 
            className="h-full w-full object-cover" 
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-lg font-bold text-primary">${getInitials(company.nome)}</span>`;
                parent.className = "h-14 w-14 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-primary/10";
              }
            }} 
          />
        </div>
      );
    }
    
    return (
      <div className="h-14 w-14 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
        <span className="text-lg font-bold text-primary">
          {getInitials(company.nome)}
        </span>
      </div>
    );
  };

  // Render actions dropdown
  const renderActions = (company: CompanyWithUsers) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800">
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2 focus:bg-gray-100 dark:focus:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onManageUsers(company);
          }}
        >
          <Users className="h-4 w-4" />
          <span>Gerenciar Usuários</span>
          {company.users_count !== undefined && (
            <Badge variant="neutral" className="ml-auto">
              {company.users_count}
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2 focus:bg-gray-100 dark:focus:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(company);
          }}
        >
          <Pencil className="h-4 w-4" />
          <span>Editar Empresa</span>
        </DropdownMenuItem>
        {(userProfile?.super_admin || deletableCompanies[company.id]) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Empresa</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Define columns
  const columns: AdminTableColumn<CompanyWithUsers>[] = [
    {
      id: 'logo',
      header: 'Logo',
      cell: (company) => renderLogo(company),
      className: 'w-20',
    },
    {
      id: 'nome',
      header: 'Empresa',
      sortable: true,
      sortField: 'nome',
      cell: (company) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {company.nome}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground lg:hidden">
            <Calendar className="h-3 w-3" />
            <span>{new Date(company.created_at || '').toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'frase_institucional',
      header: 'Frase Institucional',
      cell: (company) => (
        <div className="max-w-xs">
          {company.frase_institucional ? (
            <span className="line-clamp-2">
              {company.frase_institucional}
            </span>
          ) : (
            <span className="text-muted-foreground italic">Sem frase institucional</span>
          )}
        </div>
      ),
      responsive: { hideBelow: 'lg' },
      className: 'text-gray-600 dark:text-gray-400',
    },
    {
      id: 'users_count',
      header: 'Usuários',
      sortable: true,
      sortField: 'users_count',
      cell: (company) => (
        <Badge 
          variant={company.users_count && company.users_count > 0 ? "success" : "neutral"}
          className="flex items-center gap-1.5 w-fit"
        >
          <Users className="h-3.5 w-3.5" />
          <span className="font-semibold">{company.users_count || 0}</span>
        </Badge>
      ),
    },
    {
      id: 'created_at',
      header: 'Criada em',
      sortable: true,
      sortField: 'created_at',
      cell: (company) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(company.created_at || '').toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}</span>
        </div>
      ),
      responsive: { hideBelow: 'md' },
      className: 'text-gray-600 dark:text-gray-400',
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (company) => renderActions(company),
      align: 'right',
      className: 'w-20',
    },
  ];

  const displayCompanies = sortedCompanies.length > 0 ? sortedCompanies : companiesWithUsers;

  return (
    <AdminTable
      data={displayCompanies}
      columns={columns}
      loading={loading || usersCountLoading}
      getRowKey={(company) => company.id}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
      emptyState={{
        icon: Building,
        title: 'Nenhuma empresa encontrada',
        description: 'Comece criando uma nova empresa para começar a gerenciar usuários e configurações',
      }}
    />
  );
};
