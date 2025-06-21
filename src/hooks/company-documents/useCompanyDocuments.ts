
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyDocument, CompanyDocumentType } from '@/types/company-document';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCompanyDocuments = () => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();

  const fetchDocuments = async () => {
    if (!selectedCompany?.id) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    try {
      // Buscar documentos da empresa com relacionamento de cargos
      const { data: companyDocs, error } = await supabase
        .from('company_documents')
        .select(`
          *,
          company_document_job_roles (
            job_role_id,
            job_roles (
              id,
              title
            )
          )
        `)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company documents:', error);
        toast.error('Erro ao carregar documentos da empresa');
        return;
      }

      // Processar documentos e verificar permissões
      const processedDocs = await Promise.all(
        (companyDocs || []).map(async (doc) => {
          const roleLinks = Array.isArray(doc.company_document_job_roles) ? doc.company_document_job_roles : [];
          const hasRoleRestrictions = roleLinks.length > 0;
          let canAccess = true;

          if (hasRoleRestrictions && !userProfile?.is_admin && !userProfile?.super_admin) {
            // Verificar se usuário tem cargo necessário
            const userHasRequiredRole = roleLinks.some(
              (roleLink: any) => roleLink.job_role_id === userProfile?.cargo_id
            );
            canAccess = userHasRequiredRole;
          }

          return {
            ...doc,
            job_roles: roleLinks.map((roleLink: any) => roleLink.job_roles?.title).filter(Boolean) || [],
            can_access: canAccess
          } as CompanyDocument;
        })
      );

      // Filtrar apenas documentos que o usuário pode acessar (exceto admins)
      const accessibleDocs = userProfile?.is_admin || userProfile?.super_admin 
        ? processedDocs 
        : processedDocs.filter(doc => doc.can_access);

      setDocuments(accessibleDocs);
    } catch (error) {
      console.error('Error fetching company documents:', error);
      toast.error('Erro ao carregar documentos da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: CompanyDocumentType,
    description: string,
    name: string,
    selectedJobRoles: string[] = []
  ): Promise<boolean> => {
    if (!selectedCompany?.id || !userProfile?.id) {
      toast.error('Empresa ou usuário não selecionado');
      return false;
    }

    try {
      let filePath = null;
      let fileType = null;
      let linkUrl = null;

      if (attachmentType === 'file' && fileOrUrl instanceof File) {
        // Upload do arquivo
        const fileExtension = fileOrUrl.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        filePath = `company-documents/${selectedCompany.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, fileOrUrl);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error('Erro ao fazer upload do arquivo');
          return false;
        }

        fileType = fileOrUrl.type;
      } else if (attachmentType === 'link' && typeof fileOrUrl === 'string') {
        linkUrl = fileOrUrl;
      }

      // Criar documento da empresa
      const { data: newDoc, error: docError } = await supabase
        .from('company_documents')
        .insert({
          company_id: selectedCompany.id,
          name,
          file_path: filePath,
          file_type: fileType,
          document_type: documentType,
          description,
          link_url: linkUrl,
          attachment_type: attachmentType,
          created_by: userProfile.id
        })
        .select()
        .single();

      if (docError) {
        console.error('Error creating document:', docError);
        toast.error('Erro ao criar documento');
        return false;
      }

      // Vincular aos cargos se especificado
      if (selectedJobRoles.length > 0) {
        const roleLinks = selectedJobRoles.map(roleId => ({
          company_document_id: newDoc.id,
          job_role_id: roleId
        }));

        const { error: roleError } = await supabase
          .from('company_document_job_roles')
          .insert(roleLinks);

        if (roleError) {
          console.error('Error linking job roles:', roleError);
          // Não falhar completamente, apenas avisar
          toast.error('Documento criado, mas houve erro ao vincular cargos');
        }
      }

      toast.success('Documento da empresa criado com sucesso');
      await fetchDocuments();
      return true;
    } catch (error) {
      console.error('Error uploading company document:', error);
      toast.error('Erro ao criar documento da empresa');
      return false;
    }
  };

  const deleteDocument = async (documentToDelete: CompanyDocument): Promise<void> => {
    try {
      // Deletar vínculos com cargos primeiro
      await supabase
        .from('company_document_job_roles')
        .delete()
        .eq('company_document_id', documentToDelete.id);

      // Deletar arquivo do storage se existir
      if (documentToDelete.file_path) {
        await supabase.storage
          .from('documents')
          .remove([documentToDelete.file_path]);
      }

      // Deletar documento
      const { error } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (error) {
        console.error('Error deleting document:', error);
        toast.error('Erro ao excluir documento');
        return;
      }

      toast.success('Documento excluído com sucesso');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const downloadDocument = async (documentToDownload: CompanyDocument): Promise<void> => {
    try {
      if (documentToDownload.attachment_type === 'link' && documentToDownload.link_url) {
        window.open(documentToDownload.link_url, '_blank');
        return;
      }

      if (documentToDownload.file_path) {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(documentToDownload.file_path);

        if (error) {
          console.error('Error downloading file:', error);
          toast.error('Erro ao baixar arquivo');
          return;
        }

        const url = URL.createObjectURL(data);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = documentToDownload.name;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const previewDocument = async (documentToPreview: CompanyDocument): Promise<void> => {
    try {
      if (documentToPreview.attachment_type === 'link' && documentToPreview.link_url) {
        window.open(documentToPreview.link_url, '_blank');
        return;
      }

      if (documentToPreview.file_path) {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(documentToPreview.file_path, 3600);

        if (error) {
          console.error('Error creating signed URL:', error);
          toast.error('Erro ao visualizar arquivo');
          return;
        }

        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error previewing document:', error);
      toast.error('Erro ao visualizar documento');
    }
  };

  const canDeleteDocument = (documentToCheck: CompanyDocument): boolean => {
    if (userProfile?.super_admin) return true;
    if (userProfile?.is_admin && userProfile.id === documentToCheck.created_by) return true;
    return false;
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCompany?.id]);

  return {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    previewDocument,
    canDeleteDocument,
    refetch: fetchDocuments
  };
};
