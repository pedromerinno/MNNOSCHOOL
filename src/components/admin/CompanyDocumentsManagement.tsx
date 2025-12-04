import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Eye, Trash2, Edit, Link as LinkIcon, Files } from "lucide-react";
import { AdminPageTitle } from './AdminPageTitle';
import { useCompanies } from '@/hooks/useCompanies';
import { useCompanyDocuments } from '@/hooks/company-documents/useCompanyDocuments';
import { useJobRoles } from '@/hooks/job-roles/useJobRoles';
import { CompanyDocument } from '@/types/company-document';
import { COMPANY_DOCUMENT_TYPE_LABELS } from '@/types/company-document';
import { CompanyDocumentDialog } from '@/components/documents/CompanyDocumentDialog';
import { EditCompanyDocumentDialog } from '@/components/documents/EditCompanyDocumentDialog';
import { AdminTable, AdminTableColumn } from './AdminTable';
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export const CompanyDocumentsManagement: React.FC = () => {
  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<CompanyDocument | null>(null);
  const [documentToEdit, setDocumentToEdit] = useState<CompanyDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  const {
    documents,
    isLoading,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    previewDocument,
    canDeleteDocument,
    refetch
  } = useCompanyDocuments();

  const { jobRoles } = useJobRoles(selectedCompany);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: any,
    description: string,
    name: string,
    selectedJobRoles: string[] = [],
    selectedUsers: string[] = []
  ): Promise<boolean> => {
    setIsUploading(true);
    try {
      const success = await uploadDocument(
        attachmentType,
        fileOrUrl,
        documentType,
        description,
        name,
        selectedJobRoles,
        selectedUsers
      );
      if (success) {
        setIsNewDocumentDialogOpen(false);
      }
      return success;
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (
    documentId: string,
    name: string,
    description: string,
    documentType: any,
    selectedJobRoles: string[] = [],
    selectedUsers: string[] = []
  ): Promise<boolean> => {
    setIsUploading(true);
    try {
      const success = await updateDocument(
        documentId,
        name,
        description,
        documentType,
        selectedJobRoles,
        selectedUsers
      );
      if (success) {
        setIsEditDialogOpen(false);
        setDocumentToEdit(null);
      }
      return success;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      await deleteDocument(documentToDelete);
      setDocumentToDelete(null);
      toast.success('Documento excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir documento');
    }
  };

  const handleDownload = async (document: CompanyDocument) => {
    try {
      await downloadDocument(document);
    } catch (error) {
      toast.error('Erro ao baixar documento');
    }
  };

  const handlePreview = async (document: CompanyDocument) => {
    try {
      await previewDocument(document);
    } catch (error) {
      toast.error('Erro ao visualizar documento');
    }
  };

  const handleEditClick = (document: CompanyDocument) => {
    setDocumentToEdit(document);
    setIsEditDialogOpen(true);
  };

  const columns: AdminTableColumn<CompanyDocument>[] = [
    {
      id: 'name',
      header: 'Nome',
      accessor: 'name',
      cell: (doc) => (
        <div className="flex items-center gap-3">
          {doc.attachment_type === 'file' ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium">{doc.name}</div>
            {doc.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {doc.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Tipo',
      cell: (doc) => (
        <Badge variant="outline">
          {COMPANY_DOCUMENT_TYPE_LABELS[doc.document_type]}
        </Badge>
      ),
    },
    {
      id: 'access',
      header: 'Acesso',
      cell: (doc) => {
        const hasRoleRestrictions = doc.job_roles && doc.job_roles.length > 0;
        const hasUserRestrictions = doc.allowed_users && doc.allowed_users.length > 0;
        
        if (hasRoleRestrictions || hasUserRestrictions) {
          return (
            <div className="flex flex-col gap-1">
              {hasRoleRestrictions && (
                <Badge variant="secondary" className="text-xs">
                  {doc.job_roles?.length} {doc.job_roles?.length === 1 ? 'cargo' : 'cargos'}
                </Badge>
              )}
              {hasUserRestrictions && (
                <Badge variant="secondary" className="text-xs">
                  {doc.allowed_users?.length} {doc.allowed_users?.length === 1 ? 'usuário' : 'usuários'}
                </Badge>
              )}
            </div>
          );
        }
        return <Badge variant="outline" className="text-green-600">Público</Badge>;
      },
    },
    {
      id: 'created_at',
      header: 'Data de Criação',
      cell: (doc) => (
        <span className="text-sm text-muted-foreground">
          {new Date(doc.created_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ),
      responsive: { hideBelow: 'md' },
    },
    {
      id: 'actions',
      header: 'Ações',
      align: 'right',
      cell: (doc) => (
        <div className="flex items-center justify-end gap-2">
          {doc.attachment_type === 'file' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(doc);
                }}
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(doc);
                }}
                title="Baixar"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          {doc.attachment_type === 'link' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(doc.link_url, '_blank');
              }}
              title="Abrir link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(doc);
            }}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {canDeleteDocument(doc) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDocumentToDelete(doc);
              }}
              title="Excluir"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Documentos"
        description={selectedCompany 
          ? `Gerenciar ${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'} de ${selectedCompany.nome}` 
          : `Gerenciar ${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'}`}
        size="xl"
        actions={
          <Button
            onClick={() => setIsNewDocumentDialogOpen(true)}
            className="bg-black hover:bg-gray-800 text-white rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Documento
          </Button>
        }
      />
      
      <AdminTable
        data={documents}
        columns={columns}
        loading={isLoading}
        getRowKey={(doc) => doc.id}
        emptyState={{
          icons: [FileText, LinkIcon, Files],
          title: "Nenhum documento encontrado",
          description: "Comece adicionando um novo documento para a empresa.",
          action: {
            label: "Novo Documento",
            onClick: () => setIsNewDocumentDialogOpen(true)
          }
        }}
      />

      <CompanyDocumentDialog
        open={isNewDocumentDialogOpen}
        onOpenChange={setIsNewDocumentDialogOpen}
        onUpload={handleUpload}
        isUploading={isUploading}
        availableRoles={jobRoles}
      />

      <EditCompanyDocumentDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setDocumentToEdit(null);
          }
        }}
        document={documentToEdit}
        onUpdate={handleEdit}
        isUpdating={isUploading}
      />

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento "{documentToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

