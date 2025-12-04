import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Briefcase } from "lucide-react";
import { Company } from "@/types/company";
import { JobRole } from "@/types/job-roles";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { JobRolesList } from './JobRolesList';
import { JobRoleForm } from './JobRoleForm';
import { RoleDetailsDialog } from './dialogs/RoleDetailsDialog';
import RoleUsersDialog from '../dialogs/RoleUsersDialog';
import { AdminPageTitle } from '@/components/admin/AdminPageTitle';
import { EmptyState } from "@/components/ui/empty-state";
interface JobRolesManagerProps {
  company: Company;
}
export const JobRolesManager: React.FC<JobRolesManagerProps> = ({
  company
}) => {
  const {
    jobRoles,
    isLoading,
    editingRole,
    setEditingRole,
    newRole,
    setNewRole,
    selectedRole,
    setSelectedRole,
    showRoleUsersDialog,
    setShowRoleUsersDialog,
    handleSaveRole,
    handleDeleteRole,
    handleMoveRole,
    refreshJobRoles
  } = useJobRoles(company);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<{
    id: string;
    display_name: string;
  }[]>([]);
  const handleAddRole = useCallback(() => {
    console.log("Adding new role for company:", company.id);
    setNewRole({
      title: '',
      description: '',
      responsibilities: '',
      requirements: '',
      expectations: '',
      order_index: jobRoles.length,
      company_id: company.id
    });
  }, [jobRoles.length, company.id, setNewRole]);
  if (isLoading && jobRoles.length === 0) {
    return <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando cargos...</p>
        </CardContent>
      </Card>;
  }
  if (jobRoles.length === 0 && !newRole) {
    return (
      <div className="space-y-6">
        <AdminPageTitle
          title="Cargos"
          description={`Gerenciar cargos de ${company.nome}`}
          size="xl"
          actions={
            <Button onClick={handleAddRole}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Cargo
            </Button>
          }
        />
        <div className="flex justify-center">
          <EmptyState
            title="Nenhum cargo adicionado"
            description="Adicione informações sobre os cargos disponíveis na empresa"
            icons={[Briefcase]}
            action={{
              label: "Adicionar Primeiro Cargo",
              onClick: handleAddRole
            }}
          />
        </div>
      </div>
    );
  }
  return <div className="space-y-6">
      <AdminPageTitle
        title="Cargos"
        description={`Gerenciar ${jobRoles.length} ${jobRoles.length === 1 ? 'cargo' : 'cargos'} de ${company.nome}`}
        size="xl"
        actions={
          !newRole && !editingRole && (
            <div className="flex gap-2">
              <Button onClick={handleAddRole}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cargo
              </Button>
              {jobRoles.length > 0 && (
                <Button variant="outline" onClick={() => refreshJobRoles(true)} className="px-3">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12A10 10 0 1 0 12 2v4" />
                    <path d="M2 22V16H8" />
                    <path d="M2 16L5.5 19.5" />
                  </svg>
                </Button>
              )}
            </div>
          )
        }
      />

      {newRole && <JobRoleForm role={newRole} isNew={true} onSave={roleData => handleSaveRole(roleData, true)} onCancel={() => setNewRole(null)} />}

      {editingRole && <JobRoleForm role={editingRole} isNew={false} onSave={roleData => handleSaveRole(roleData, false)} onCancel={() => setEditingRole(null)} />}

      {jobRoles.length > 0 && !newRole && !editingRole && (
        <JobRolesList 
          jobRoles={jobRoles} 
          onMoveRole={handleMoveRole} 
          onShowDetails={role => {
            setSelectedRole(role);
            setShowDetailsDialog(true);
          }} 
          onManageUsers={role => {
            setSelectedRole(role);
            setShowRoleUsersDialog(true);
          }} 
          onEditRole={setEditingRole} 
          onDeleteRole={handleDeleteRole}
          companyId={company.id}
          companyColor={company.cor_principal}
        />
      )}

      {selectedRole && <RoleDetailsDialog role={selectedRole} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} assignedUsers={assignedUsers} />}

      {selectedRole && <RoleUsersDialog roleId={selectedRole.id} companyId={company.id} open={showRoleUsersDialog} onOpenChange={setShowRoleUsersDialog} />}
    </div>;
};