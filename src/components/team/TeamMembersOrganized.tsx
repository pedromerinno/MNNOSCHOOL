
import React, { useState, useEffect } from 'react';
import { TeamMember } from "@/hooks/team/useTeamMembersOptimized";
import { AdminMembersSection } from './sections/AdminMembersSection';
import { RoleMembersSection } from './sections/RoleMembersSection';
import { UnassignedMembersSection } from './sections/UnassignedMembersSection';
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";

interface TeamMembersOrganizedProps {
  members: TeamMember[];
  companyId?: string;
  companyColor?: string;
}

interface OrganizedMembers {
  admins: TeamMember[];
  roleGroups: Array<{
    role: JobRole;
    members: TeamMember[];
  }>;
  unassigned: TeamMember[];
}

export const TeamMembersOrganized: React.FC<TeamMembersOrganizedProps> = ({
  members,
  companyId,
  companyColor = "#1EAEDB"
}) => {
  const [organizedMembers, setOrganizedMembers] = useState<OrganizedMembers>({
    admins: [],
    roleGroups: [],
    unassigned: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const organizeMembers = async () => {
      if (!companyId || members.length === 0) {
        setOrganizedMembers({
          admins: [],
          roleGroups: [],
          unassigned: members
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Buscar todos os cargos da empresa
        const { data: roles, error: rolesError } = await supabase
          .from('job_roles')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index', { ascending: true });

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          setOrganizedMembers({
            admins: members.filter(m => m.is_admin),
            roleGroups: [],
            unassigned: members.filter(m => !m.is_admin)
          });
          return;
        }

        // Separar administradores (is_admin agora vem de user_empresa)
        const admins = members.filter(member => member.is_admin === true);
        
        // Organizar por cargos
        const roleGroups: Array<{ role: JobRole; members: TeamMember[] }> = [];
        const assignedMemberIds = new Set<string>();

        if (roles && roles.length > 0) {
          for (const role of roles) {
            const roleMembers = members.filter(member => 
              member.cargo_id === role.id && !member.is_admin
            );
            
            if (roleMembers.length > 0) {
              roleGroups.push({
                role: role as JobRole,
                members: roleMembers
              });
              
              // Marcar como atribuídos
              roleMembers.forEach(member => {
                if (member.id) assignedMemberIds.add(member.id);
              });
            }
          }
        }

        // Membros sem cargo (excluindo admins)
        const unassigned = members.filter(member => 
          !member.is_admin && 
          !assignedMemberIds.has(member.id || '')
        );

        setOrganizedMembers({
          admins,
          roleGroups,
          unassigned
        });

      } catch (error) {
        console.error('Error organizing members:', error);
        setOrganizedMembers({
          admins: members.filter(m => m.is_admin),
          roleGroups: [],
          unassigned: members.filter(m => !m.is_admin)
        });
      } finally {
        setIsLoading(false);
      }
    };

    organizeMembers();
  }, [members, companyId]);

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
    <div className="space-y-8">
      {/* Seção de Administradores */}
      {organizedMembers.admins.length > 0 && (
        <AdminMembersSection 
          members={organizedMembers.admins}
          companyColor={companyColor}
        />
      )}

      {/* Seções por Cargo */}
      {organizedMembers.roleGroups.map(({ role, members: roleMembers }) => (
        <RoleMembersSection
          key={role.id}
          role={role}
          members={roleMembers}
          companyColor={companyColor}
        />
      ))}

      {/* Membros sem cargo */}
      {organizedMembers.unassigned.length > 0 && (
        <UnassignedMembersSection 
          members={organizedMembers.unassigned}
          companyColor={companyColor}
        />
      )}

      {/* Estado vazio */}
      {members.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum membro encontrado nesta empresa.
          </p>
        </div>
      )}
    </div>
  );
};
