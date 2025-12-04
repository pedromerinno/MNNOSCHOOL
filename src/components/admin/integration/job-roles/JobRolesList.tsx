
import React, { useState, useEffect, useMemo } from 'react';
import { JobRole } from "@/types/job-roles";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Info, Users, Edit, Trash2, Briefcase, MoreHorizontal } from "lucide-react";
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminFilterBar, FilterConfig } from '@/components/admin/AdminFilterBar';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JobRoleWithCount extends JobRole {
  userCount?: number;
}

interface JobRolesListProps {
  jobRoles: JobRole[];
  onMoveRole: (roleId: string, direction: 'up' | 'down') => void;
  onShowDetails: (role: JobRole) => void;
  onManageUsers: (role: JobRole) => void;
  onEditRole: (role: JobRole) => void;
  onDeleteRole: (roleId: string) => void;
  companyId: string;
  companyColor?: string;
}

export const JobRolesList = ({
  jobRoles,
  onMoveRole,
  onShowDetails,
  onManageUsers,
  onEditRole,
  onDeleteRole,
  companyId,
  companyColor
}: JobRolesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rolesWithCount, setRolesWithCount] = useState<JobRoleWithCount[]>([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // Fetch user counts for each role
  useEffect(() => {
    const fetchUserCounts = async () => {
      if (!companyId || jobRoles.length === 0) {
        setRolesWithCount(jobRoles);
        return;
      }

      setIsLoadingCounts(true);
      try {
        // Get all user_empresa records for this company with cargo_id
        const { data: userEmpresaData, error } = await supabase
          .from('user_empresa')
          .select('cargo_id')
          .eq('empresa_id', companyId)
          .not('cargo_id', 'is', null);

        if (error) throw error;

        // Count users per role
        const roleCounts: Record<string, number> = {};
        (userEmpresaData || []).forEach(item => {
          if (item.cargo_id) {
            roleCounts[item.cargo_id] = (roleCounts[item.cargo_id] || 0) + 1;
          }
        });

        // Merge counts with roles
        const rolesWithUserCounts = jobRoles.map(role => ({
          ...role,
          userCount: roleCounts[role.id] || 0
        }));

        setRolesWithCount(rolesWithUserCounts);
      } catch (error) {
        console.error('Error fetching user counts:', error);
        // Fallback to roles without counts
        setRolesWithCount(jobRoles);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchUserCounts();
  }, [jobRoles, companyId]);

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return rolesWithCount;

    const term = searchTerm.toLowerCase();
    return rolesWithCount.filter(role =>
      role.title?.toLowerCase().includes(term) ||
      role.description?.toLowerCase().includes(term)
    );
  }, [rolesWithCount, searchTerm]);

  const filterConfigs: FilterConfig[] = [
    {
      type: 'text',
      id: 'search',
      placeholder: 'Buscar por título ou descrição...',
      value: searchTerm,
      onChange: setSearchTerm
    }
  ];

  const hasActiveFilters = searchTerm.trim().length > 0;

  const columns: AdminTableColumn<JobRoleWithCount>[] = [
    {
      id: 'order',
      header: '',
      accessor: 'order_index',
      sortable: false,
      align: 'center',
      className: 'w-16',
      cell: (role) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveRole(role.id, 'up');
                  }}
                  disabled={role.order_index === 0}
                  className="h-7 w-7 opacity-60 hover:opacity-100"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mover para cima</TooltipContent>
            </Tooltip>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-[20px] text-center">
              {role.order_index + 1}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveRole(role.id, 'down');
                  }}
                  disabled={role.order_index === (jobRoles.length - 1)}
                  className="h-7 w-7 opacity-60 hover:opacity-100"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mover para baixo</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    },
    {
      id: 'title',
      header: 'Cargo',
      accessor: 'title',
      sortable: false,
      cell: (role) => (
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{role.title}</p>
          {role.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-lg">
              {role.description}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'details',
      header: 'Informações',
      sortable: false,
      cell: (role) => {
        const hasResponsibilities = role.responsibilities && role.responsibilities.trim().length > 0;
        const hasRequirements = role.requirements && role.requirements.trim().length > 0;
        const hasExpectations = role.expectations && role.expectations.trim().length > 0;
        
        if (!hasResponsibilities && !hasRequirements && !hasExpectations) {
          return (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
              Sem informações adicionais
            </span>
          );
        }

        return (
          <div className="flex flex-wrap gap-2">
            {hasResponsibilities && (
              <Badge variant="outline" className="text-xs">
                Responsabilidades
              </Badge>
            )}
            {hasRequirements && (
              <Badge variant="outline" className="text-xs">
                Requisitos
              </Badge>
            )}
            {hasExpectations && (
              <Badge variant="outline" className="text-xs">
                Expectativas
              </Badge>
            )}
          </div>
        );
      },
      responsive: {
        hideBelow: 'lg'
      }
    },
    {
      id: 'users',
      header: 'Usuários',
      sortable: false,
      align: 'center',
      className: 'w-28',
      cell: (role) => (
        <div className="flex items-center justify-center">
          {isLoadingCounts ? (
            <span className="text-sm text-gray-400">...</span>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={role.userCount && role.userCount > 0 ? "default" : "secondary"}
                    className={`flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity px-2.5 py-1 ${
                      role.userCount && role.userCount > 0 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' 
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onManageUsers(role);
                    }}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-semibold">{role.userCount || 0}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {role.userCount === 0 
                    ? 'Nenhum usuário atribuído' 
                    : `${role.userCount} usuário${role.userCount !== 1 ? 's' : ''} com este cargo`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
    {
      id: 'actions',
      header: '',
      sortable: false,
      align: 'right',
      className: 'w-12',
      cell: (role) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onShowDetails(role);
            }}>
              <Info className="h-4 w-4 mr-2" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onManageUsers(role);
            }}>
              <Users className="h-4 w-4 mr-2" />
              Gerenciar usuários
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEditRole(role);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar cargo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRole(role.id);
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir cargo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <AdminFilterBar
          filters={filterConfigs}
          companyColor={companyColor}
          showClearButton={true}
          onClear={() => setSearchTerm('')}
          hasActiveFilters={hasActiveFilters}
          resultsCount={{
            current: filteredRoles.length,
            total: jobRoles.length,
            label: 'cargo',
            showTotalWhenFiltered: true
          }}
        />
      </div>

      {/* Tabela */}
      <AdminTable
        data={filteredRoles}
        columns={columns}
        loading={isLoadingCounts}
        getRowKey={(role) => role.id}
        emptyState={{
          icon: Briefcase,
          title: hasActiveFilters ? 'Nenhum cargo encontrado' : 'Nenhum cargo adicionado',
          description: hasActiveFilters
            ? 'Tente ajustar os filtros para encontrar cargos'
            : 'Adicione seu primeiro cargo para começar a gerenciar os cargos da empresa.'
        }}
        onRowClick={(role) => onShowDetails(role)}
      />
    </div>
  );
};
