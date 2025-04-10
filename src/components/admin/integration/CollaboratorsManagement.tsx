
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, UserPlus } from "lucide-react";
import { Company } from "@/types/company";
import { useCollaboratorManagement } from "@/hooks/useCollaboratorManagement";
import { LoadingCollaborators } from './collaborators/LoadingCollaborators';
import { EmptyCollaboratorsList } from './collaborators/EmptyCollaboratorsList';
import { CollaboratorsList } from './collaborators/CollaboratorsList';
import { AddUsersDialog } from './collaborators/AddUsersDialog';
import { RoleManagementDialog } from './collaborators/RoleManagementDialog';

interface CollaboratorsManagementProps {
  company: Company;
}

export const CollaboratorsManagement: React.FC<CollaboratorsManagementProps> = ({ company }) => {
  const {
    isLoading,
    loadingUsers,
    filteredCompanyUsers,
    availableUsers,
    userRoles,
    searchTerm,
    setSearchTerm,
    addUserToCompany,
    removeUserFromCompany,
    setReloadTrigger
  } = useCollaboratorManagement(company);

  const [showAddUsersDialog, setShowAddUsersDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Open dialog to manage user's role
  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };
  
  // Handle role update success
  const handleRoleUpdateSuccess = () => {
    setReloadTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Colaboradores</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os colaboradores da empresa e seus cargos
          </p>
        </div>
        
        <Button onClick={() => setShowAddUsersDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Colaboradores
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar colaboradores..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isLoading || loadingUsers ? (
        <LoadingCollaborators />
      ) : filteredCompanyUsers.length === 0 ? (
        <EmptyCollaboratorsList 
          searchTerm={searchTerm} 
          company={company} 
          onAddClick={() => setShowAddUsersDialog(true)} 
        />
      ) : (
        <CollaboratorsList 
          users={filteredCompanyUsers}
          userRoles={userRoles}
          onManageRole={openRoleDialog}
          onRemoveUser={removeUserFromCompany}
        />
      )}
      
      {/* Dialog to add users */}
      <AddUsersDialog 
        open={showAddUsersDialog}
        onOpenChange={setShowAddUsersDialog}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableUsers={availableUsers}
        loadingUsers={loadingUsers}
        onAddUser={addUserToCompany}
      />
      
      {/* Dialog to manage user role */}
      <RoleManagementDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        companyId={company.id}
        onSuccess={handleRoleUpdateSuccess}
      />
    </div>
  );
};
