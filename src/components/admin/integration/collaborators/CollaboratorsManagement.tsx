
import React, { useState } from 'react';
import { Company } from "@/types/company";
import { useCollaboratorManagement } from "@/hooks/collaborator";
import { LoadingCollaborators } from './LoadingCollaborators';
import { EmptyCollaboratorsList } from './EmptyCollaboratorsList';
import { CollaboratorsList } from './CollaboratorsList';
import { AddUsersDialog } from './AddUsersDialog';
import { RoleManagementDialog } from './RoleManagementDialog';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { UserDocumentsList } from './UserDocumentsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { CollaboratorsHeader } from './header/CollaboratorsHeader';
import { CollaboratorSearch } from './search/CollaboratorSearch';
import { useDialogState } from '@/hooks/collaborator/useDialogState';
import { toast } from "sonner";

interface CollaboratorsManagementProps {
  company: Company;
}

export const CollaboratorsManagement: React.FC<CollaboratorsManagementProps> = ({ company }) => {
  const [refreshing, setRefreshing] = useState(false);
  
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
    setReloadTrigger,
    error
  } = useCollaboratorManagement(company);

  const {
    showAddUsersDialog,
    setShowAddUsersDialog,
    showRoleDialog,
    setShowRoleDialog,
    showDocumentsDialog,
    setShowDocumentsDialog,
    showUploadDialog,
    setShowUploadDialog,
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
  } = useDialogState();

  const {
    documents,
    isLoading: isLoadingDocuments,
    uploadDocument,
    deleteDocument,
    refreshDocuments
  } = useUserDocuments(
    selectedUser?.id || null,
    company?.id || null
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setReloadTrigger(prev => prev + 1);
    
    setTimeout(() => {
      setRefreshing(false);
      if (isLoading) {
        toast.warning("Carregamento está demorando mais que o esperado");
      }
    }, 5000);
  };

  const handleRoleUpdateSuccess = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const handleUploadComplete = () => {
    refreshDocuments();
    setShowUploadDialog(false);
  };

  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const openDocumentsDialog = (user: any) => {
    setSelectedUser(user);
    setShowDocumentsDialog(true);
    setActiveTab("documents");
  };

  if (isLoading || loadingUsers) {
    return <LoadingCollaborators error={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="space-y-6">
      <CollaboratorsHeader
        onAddClick={() => setShowAddUsersDialog(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        error={error}
        company={company}
      />
      
      <CollaboratorSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={isLoading}
        disabled={!company?.id}
      />
      
      {filteredCompanyUsers.length === 0 ? (
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
          onManageDocuments={openDocumentsDialog}
          onRemoveUser={removeUserFromCompany}
        />
      )}

      {/* Dialogs */}
      <AddUsersDialog 
        open={showAddUsersDialog}
        onOpenChange={setShowAddUsersDialog}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableUsers={availableUsers}
        loadingUsers={loadingUsers}
        onAddUser={addUserToCompany}
      />
      
      <RoleManagementDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        companyId={company.id}
        onSuccess={handleRoleUpdateSuccess}
      />

      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `Documentos de ${selectedUser.display_name || selectedUser.email}` : 'Documentos do Colaborador'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="documents" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="mt-4">
                <UserDocumentsList
                  documents={documents}
                  isLoading={isLoadingDocuments}
                  onDelete={deleteDocument}
                  onUploadClick={() => setShowUploadDialog(true)}
                  userId={selectedUser.id}
                  companyId={company.id}
                  onRefresh={refreshDocuments}
                />
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowDocumentsDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {selectedUser && (
        <DocumentUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          userId={selectedUser.id}
          companyId={company.id}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
};
