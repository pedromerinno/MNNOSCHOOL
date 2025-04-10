
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, UserPlus, FileText, RefreshCw, AlertCircle } from "lucide-react";
import { Company } from "@/types/company";
import { useCollaboratorManagement } from "@/hooks/collaborator";
import { LoadingCollaborators } from './collaborators/LoadingCollaborators';
import { EmptyCollaboratorsList } from './collaborators/EmptyCollaboratorsList';
import { CollaboratorsList } from './collaborators/CollaboratorsList';
import { AddUsersDialog } from './collaborators/AddUsersDialog';
import { RoleManagementDialog } from './collaborators/RoleManagementDialog';
import { DocumentUploadDialog } from './collaborators/DocumentUploadDialog';
import { UserDocumentsList } from './collaborators/UserDocumentsList';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("users");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Force a reload when component mounts or company changes
  useEffect(() => {
    console.log("CollaboratorsManagement: Company changed to", company.nome);
    setReloadTrigger(prev => prev + 1);
    setError(null); // Reset error state on company change
  }, [company.id, setReloadTrigger]);
  
  // User documents management
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
  
  // Open dialog to manage user's role
  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };
  
  // Open dialog to view/manage user's documents
  const openDocumentsDialog = (user: any) => {
    setSelectedUser(user);
    setShowDocumentsDialog(true);
    setActiveTab("documents");
  };
  
  // Handle role update success
  const handleRoleUpdateSuccess = () => {
    setReloadTrigger(prev => prev + 1);
  };
  
  // Handle document upload complete
  const handleUploadComplete = () => {
    refreshDocuments();
    setShowUploadDialog(false);
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    setReloadTrigger(prev => prev + 1);
    
    // Set a timeout to ensure the refreshing state doesn't get stuck
    setTimeout(() => {
      setRefreshing(false);
      // If still loading after timeout, show a message
      if (isLoading) {
        toast.warning("Carregamento está demorando mais que o esperado");
      }
    }, 5000);
  };

  // Clear the error state if loading is completed
  useEffect(() => {
    if (!isLoading && error) {
      setError(null);
    }
  }, [isLoading, error]);
  
  // Handle adding a user with proper error handling
  const handleAddUser = async (userId: string) => {
    try {
      const result = await addUserToCompany(userId);
      if (result === false) {
        console.log("User could not be added to company");
      }
      return result;
    } catch (error) {
      console.error("Error in handleAddUser:", error);
      return false;
    }
  };

  // Handle removing a user with proper error handling
  const handleRemoveUser = async (userId: string) => {
    try {
      const result = await removeUserFromCompany(userId);
      if (result === false) {
        console.log("User could not be removed from company");
      }
      return result;
    } catch (error) {
      console.error("Error in handleRemoveUser:", error);
      return false;
    }
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
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing || !company?.id}
            title="Atualizar"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={() => setShowAddUsersDialog(true)}
            disabled={!company?.id}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Colaboradores
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar colaboradores..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={isLoading || !company?.id}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchTerm("")}
            disabled={isLoading}
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
          onManageDocuments={openDocumentsDialog}
          onRemoveUser={handleRemoveUser}
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
        onAddUser={handleAddUser}
      />
      
      {/* Dialog to manage user role */}
      <RoleManagementDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        companyId={company.id}
        onSuccess={handleRoleUpdateSuccess}
      />

      {/* Dialog to manage user documents */}
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
      
      {/* Dialog to upload document */}
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
