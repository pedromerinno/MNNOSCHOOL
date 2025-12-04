
import React, { useState, useEffect, useMemo } from 'react';
import { TeamMember } from "@/hooks/team/useTeamMembersOptimized";
import { AdminMembersSection } from './sections/AdminMembersSection';
import { RegularMembersSection } from './sections/RegularMembersSection';
import { TeamFilterBar } from './TeamFilterBar';
import { ViewToggle } from './ViewToggle';
import { TeamMembersTable } from './TeamMembersTable';
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";

interface TeamMembersSimplifiedProps {
  members: TeamMember[];
  companyId?: string;
  companyColor?: string;
}

export const TeamMembersSimplified: React.FC<TeamMembersSimplifiedProps> = ({
  members,
  companyId,
  companyColor = "#1EAEDB"
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [availableRoles, setAvailableRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'cards' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch available roles for the company
  useEffect(() => {
    const fetchRoles = async () => {
      if (!companyId) {
        setAvailableRoles([]);
        setIsLoading(false);
        return;
      }

      // Verificar cache primeiro
      const cacheKey = `job_roles_${companyId}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          
          // Cache válido por 10 minutos (roles mudam menos frequentemente)
          if (now - timestamp < 10 * 60 * 1000) {
            setAvailableRoles(data);
            setIsLoading(false);
            // Continuar buscando em background
          }
        }
      } catch (e) {
        // Cache inválido, continuar com fetch
      }

      try {
        const { data: roles, error } = await supabase
          .from('job_roles')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching roles:', error);
          setAvailableRoles([]);
        } else {
          const rolesData = roles || [];
          setAvailableRoles(rolesData);
          
          // Salvar no cache
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: rolesData,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.warn('Erro ao salvar cache de roles:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setAvailableRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [companyId]);

  // Filter members based on search query
  const filterMembersBySearch = (membersList: TeamMember[]) => {
    if (!searchQuery.trim()) return membersList;
    
    const query = searchQuery.toLowerCase().trim();
    return membersList.filter(member => 
      member.display_name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  };

  // Filter members based on selected role
  const filterMembersByRole = (membersList: TeamMember[]) => {
    if (selectedRoleFilter === 'all') {
      return membersList;
    }
    if (selectedRoleFilter === 'unassigned') {
      return membersList.filter(member => !member.cargo_id);
    }
    return membersList.filter(member => member.cargo_id === selectedRoleFilter);
  };

  // Separate admins and regular members
  // is_admin agora vem de user_empresa (incluído no TeamMember)
  const admins = useMemo(() => {
    const filtered = filterMembersBySearch(members.filter(member => member.is_admin === true));
    return filtered;
  }, [members, searchQuery]);

  const regularMembers = useMemo(() => {
    const filtered = filterMembersBySearch(members.filter(member => !member.is_admin));
    return filterMembersByRole(filtered);
  }, [members, selectedRoleFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Filter Bar */}
      <TeamFilterBar
        availableRoles={availableRoles}
        selectedRole={selectedRoleFilter}
        onRoleChange={setSelectedRoleFilter}
        companyColor={companyColor}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewToggle={
          <ViewToggle
            view={view}
            onViewChange={setView}
            companyColor={companyColor}
          />
        }
      />

      {/* Seção de Administradores */}
      {admins.length > 0 && (
        <div className="space-y-6">
          {view === 'cards' ? (
            <AdminMembersSection 
              members={admins}
              companyColor={companyColor}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Administradores
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {admins.length} {admins.length === 1 ? 'administrador' : 'administradores'}
                  </p>
                </div>
              </div>
              <TeamMembersTable
                members={admins}
                companyColor={companyColor}
                availableRoles={availableRoles}
              />
            </div>
          )}
        </div>
      )}

      {/* Seção da Equipe */}
      {view === 'cards' ? (
        <RegularMembersSection 
          members={regularMembers}
          companyColor={companyColor}
          selectedRoleFilter={selectedRoleFilter}
          availableRoles={availableRoles}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedRoleFilter === 'all' 
                  ? 'Equipe' 
                  : selectedRoleFilter === 'unassigned'
                  ? 'Sem Cargo Definido'
                  : availableRoles.find(r => r.id === selectedRoleFilter)?.title || 'Equipe'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {regularMembers.length} {regularMembers.length === 1 ? 'membro' : 'membros'}
              </p>
            </div>
          </div>
          <TeamMembersTable
            members={regularMembers}
            companyColor={companyColor}
            availableRoles={availableRoles}
          />
        </div>
      )}

      {/* Estado vazio */}
      {members.length === 0 && (
        <div className="flex justify-center py-12">
          <EmptyState
            title="Nenhum membro encontrado"
            description="Nenhum membro encontrado nesta empresa."
            icons={[Users]}
          />
        </div>
      )}

      {/* Estado vazio após filtros */}
      {members.length > 0 && admins.length === 0 && regularMembers.length === 0 && (
        <div className="flex justify-center py-12">
          <EmptyState
            title="Nenhum resultado encontrado"
            description="Tente ajustar os filtros ou a busca para encontrar membros."
            icons={[Users]}
          />
        </div>
      )}
    </div>
  );
};
