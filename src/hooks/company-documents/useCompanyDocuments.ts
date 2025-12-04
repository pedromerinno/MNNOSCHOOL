
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyDocument, CompanyDocumentType } from '@/types/company-document';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/company/useIsAdmin';
import { toast } from 'sonner';
import { generateThumbnail } from '@/utils/thumbnailGenerator';

export const useCompanyDocuments = () => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const { isAdmin } = useIsAdmin();

  const fetchDocuments = async (forceRefresh = false) => {
    if (!selectedCompany?.id) {
      setDocuments([]);
      return;
    }

    if (!userProfile?.id) {
      console.warn('[CompanyDocuments] userProfile não carregado ainda, aguardando...');
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    try {
      // Se for refresh forçado, limpar o estado primeiro para evitar mostrar dados antigos
      if (forceRefresh) {
        console.log('[CompanyDocuments] Forçando refresh - limpando estado atual');
        setDocuments([]);
        // Pequeno delay para garantir que o estado foi limpo antes de buscar
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log('[CompanyDocuments] Iniciando busca de documentos:', {
        companyId: selectedCompany.id,
        userId: userProfile?.id,
        isAdmin: isAdmin,
        isSuperAdmin: userProfile?.super_admin
      });

      // Buscar documentos da empresa com relacionamentos de cargos e usuários
      // Forçar nova query sem cache
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
          ),
          company_document_users (
            user_id,
            profiles (
              id,
              display_name,
              email
            )
          )
        `)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      console.log('[CompanyDocuments] Resultado da query:', {
        documentsCount: companyDocs?.length || 0,
        error: error?.message,
        hasError: !!error
      });

      if (error) {
        console.error('[CompanyDocuments] Erro ao buscar documentos:', error);
        toast.error('Erro ao carregar documentos da empresa');
        setDocuments([]);
        return;
      }

      if (!companyDocs || companyDocs.length === 0) {
        console.log('[CompanyDocuments] Nenhum documento encontrado no banco de dados para a empresa:', selectedCompany.id);
        setDocuments([]);
        return;
      }

      // Processar documentos e verificar permissões
      const processedDocs = await Promise.all(
        (companyDocs || []).map(async (doc) => {
          const roleLinks = Array.isArray(doc.company_document_job_roles) ? doc.company_document_job_roles : [];
          const userLinks = Array.isArray(doc.company_document_users) ? doc.company_document_users : [];
          
          const hasRoleRestrictions = roleLinks.length > 0;
          const hasUserRestrictions = userLinks.length > 0;
          let canAccess = true;

          console.log('[CompanyDocuments] Processando documento:', {
            docId: doc.id,
            docName: doc.name,
            hasRoleRestrictions,
            hasUserRestrictions,
            roleLinksCount: roleLinks.length,
            userLinksCount: userLinks.length,
            currentUserId: userProfile?.id,
            isAdmin: isAdmin
          });

          // Se não é admin e há restrições, verificar acesso
          if (!isAdmin && (hasRoleRestrictions || hasUserRestrictions)) {
            let hasRoleAccess = false;
            let hasUserAccess = false;

            // Se há restrições de cargo, verificar se o usuário tem o cargo necessário
            if (hasRoleRestrictions) {
              hasRoleAccess = roleLinks.some(
                (roleLink: any) => roleLink.job_role_id === userProfile?.cargo_id
              );
            }

            // Se há restrições de usuário, verificar se o usuário está na lista
            if (hasUserRestrictions) {
              hasUserAccess = userLinks.some(
                (userLink: any) => userLink.user_id === userProfile?.id
              );
            }

            // Lógica de acesso:
            // - Se há restrições de cargo E de usuário: precisa ter acesso por cargo OU por usuário
            // - Se há apenas restrições de cargo: precisa ter acesso por cargo
            // - Se há apenas restrições de usuário: precisa ter acesso por usuário
            if (hasRoleRestrictions && hasUserRestrictions) {
              // Restrições de ambos: acesso por cargo OU por usuário
              canAccess = hasRoleAccess || hasUserAccess;
            } else if (hasRoleRestrictions) {
              // Apenas restrições de cargo: precisa ter acesso por cargo
              canAccess = hasRoleAccess;
            } else if (hasUserRestrictions) {
              // Apenas restrições de usuário: precisa ter acesso por usuário
              canAccess = hasUserAccess;
            }
            
            console.log('[CompanyDocuments] Verificação de acesso:', {
              docId: doc.id,
              docName: doc.name,
              hasRoleRestrictions,
              hasUserRestrictions,
              hasRoleAccess,
              hasUserAccess,
              canAccess,
              userCargoId: userProfile?.cargo_id,
              currentUserId: userProfile?.id,
              allowedUserIds: userLinks.map((ul: any) => ul.user_id),
              allowedRoleIds: roleLinks.map((rl: any) => rl.job_role_id)
            });
          }

          return {
            ...doc,
            job_roles: roleLinks.map((roleLink: any) => roleLink.job_roles?.title).filter(Boolean) || [],
            job_role_ids: roleLinks.map((roleLink: any) => roleLink.job_role_id).filter(Boolean) || [],
            allowed_users: userLinks.map((userLink: any) => userLink.profiles?.display_name).filter(Boolean) || [],
            allowed_user_ids: userLinks.map((userLink: any) => userLink.user_id).filter(Boolean) || [],
            can_access: canAccess
          } as CompanyDocument;
        })
      );

      // Filtrar apenas documentos que o usuário pode acessar (exceto admins)
      const accessibleDocs = isAdmin 
        ? processedDocs 
        : processedDocs.filter(doc => {
            const hasAccess = doc.can_access;
            if (!hasAccess) {
              console.log('[CompanyDocuments] Documento filtrado (sem acesso):', {
                docId: doc.id,
                docName: doc.name,
                hasRoleRestrictions: (doc.job_role_ids?.length || 0) > 0,
                hasUserRestrictions: (doc.allowed_user_ids?.length || 0) > 0,
                currentUserId: userProfile?.id
              });
            }
            return hasAccess;
          });

      console.log('[CompanyDocuments] Documentos finais:', {
        totalProcessed: processedDocs.length,
        totalAccessible: accessibleDocs.length,
        currentUserId: userProfile?.id,
        isAdmin: isAdmin
      });

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
    selectedJobRoles: string[] = [],
    selectedUsers: string[] = []
  ): Promise<boolean> => {
    if (!selectedCompany?.id) {
      toast.error('Por favor, selecione uma empresa no menu superior');
      return false;
    }
    
    if (!userProfile?.id) {
      toast.error('Usuário não identificado. Por favor, faça login novamente');
      return false;
    }

    try {
      // Log para diagnóstico
      console.log('[CompanyDocuments] Iniciando upload:', {
        user_id: userProfile.id,
        company_id: selectedCompany.id,
        is_super_admin: userProfile.super_admin,
        attachment_type: attachmentType
      });
      let filePath = null;
      let fileType = null;
      let linkUrl = null;
      let thumbnailPath = null; // Declarar no escopo correto para ser acessível em todo o bloco try

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

        // Gerar e fazer upload do thumbnail (mantém síncrono mas rápido)
        try {
          const thumbnailFile = await generateThumbnail(fileOrUrl);
          if (thumbnailFile) {
            const thumbnailExtension = 'jpg';
            const thumbnailFileName = `thumb_${Date.now()}.${thumbnailExtension}`;
            thumbnailPath = `company-documents/${selectedCompany.id}/thumbnails/${thumbnailFileName}`;

            const { error: thumbnailError } = await supabase.storage
              .from('documents')
              .upload(thumbnailPath, thumbnailFile);

            if (thumbnailError) {
              console.warn('Error uploading thumbnail:', thumbnailError);
              // Não falhar o upload se o thumbnail falhar
              thumbnailPath = null;
            }
          }
        } catch (error) {
          console.warn('Error generating thumbnail:', error);
          // Não falhar o upload se o thumbnail falhar
          thumbnailPath = null;
        }
      } else if (attachmentType === 'link' && typeof fileOrUrl === 'string') {
        linkUrl = fileOrUrl;
      }

      // Validar dados antes de inserir
      if (!attachmentType || (attachmentType !== 'file' && attachmentType !== 'link')) {
        toast.error('Tipo de anexo inválido');
        return false;
      }

      if (attachmentType === 'file' && !filePath) {
        toast.error('Caminho do arquivo não encontrado');
        return false;
      }

      if (attachmentType === 'link' && !linkUrl) {
        toast.error('URL do link não fornecida');
        return false;
      }

      // Preparar dados para inserção - garantir que campos opcionais sejam null quando não tiverem valor
      const documentData: any = {
        company_id: selectedCompany.id,
        name: name.trim(),
        document_type: documentType,
        attachment_type: attachmentType,
        created_by: userProfile.id
      };

      // Adicionar campos opcionais - usar null explicitamente quando não tiverem valor
      if (attachmentType === 'file') {
        documentData.file_path = filePath || null;
        documentData.file_type = fileType || null;
        documentData.link_url = null;
      } else {
        documentData.file_path = null;
        documentData.file_type = null;
        documentData.link_url = linkUrl || null;
      }

      // Campos sempre opcionais
      documentData.thumbnail_path = thumbnailPath || null;
      documentData.description = description?.trim() || null;

      console.log('[CompanyDocuments] Dados para inserção:', documentData);

      // Criar documento da empresa
      const { data: newDoc, error: docError } = await supabase
        .from('company_documents')
        .insert(documentData)
        .select()
        .single();

      if (docError) {
        console.error('[CompanyDocuments] Erro ao criar documento:', {
          error: docError,
          code: docError.code,
          message: docError.message,
          details: docError.details,
          hint: docError.hint,
          data: documentData
        });
        
        // Mensagem mais específica para erros de permissão RLS
        let errorMessage = docError.message || 'Verifique os dados e tente novamente';
        if (docError.code === '42501' || 
            docError.message?.includes('permission denied') || 
            docError.message?.includes('new row violates row-level security') ||
            docError.message?.includes('row-level security')) {
          errorMessage = 'Você não tem permissão para criar documentos nesta empresa. Verifique se você é administrador da empresa.';
        } else if (docError.code === '23503') {
          errorMessage = 'Erro de referência: Verifique se a empresa e o usuário existem.';
        } else if (docError.code === '23502') {
          errorMessage = 'Campos obrigatórios faltando: Verifique se todos os campos necessários foram preenchidos.';
        }
        
        toast.error('Erro ao criar documento', {
          description: errorMessage
        });
        return false;
      }

      console.log('[CompanyDocuments] Documento criado com sucesso:', newDoc?.id);

      // Mostrar sucesso imediatamente
      toast.success('Documento da empresa criado com sucesso');
      
      // Retornar true imediatamente para fechar o popup
      // Fazer vínculos e refresh em background
      (async () => {
        try {
          // Vincular aos cargos e usuários em paralelo
          await Promise.all([
            // Vincular aos cargos se especificado
            selectedJobRoles.length > 0
              ? supabase
                  .from('company_document_job_roles')
                  .insert(selectedJobRoles.map(roleId => ({
                    company_document_id: newDoc.id,
                    job_role_id: roleId
                  })))
                  .then(({ error: roleError }) => {
                    if (roleError) {
                      console.error('Error linking job roles:', roleError);
                      toast.error('Erro ao vincular cargos');
                    }
                  })
              : Promise.resolve(),
            
            // Vincular aos usuários se especificado
            selectedUsers.length > 0
              ? supabase
                  .from('company_document_users')
                  .insert(selectedUsers.map(userId => ({
                    company_document_id: newDoc.id,
                    user_id: userId
                  })))
                  .then(({ error: userError }) => {
                    if (userError) {
                      console.error('Error linking users:', userError);
                      toast.error('Erro ao vincular usuários');
                    }
                  })
              : Promise.resolve()
          ]);

          // Fazer refresh da lista em background
          await fetchDocuments();
        } catch (error) {
          console.error('Error in background operations:', error);
          // Não mostrar erro ao usuário, apenas logar
        }
      })();
      
      return true;
    } catch (error) {
      console.error('Error uploading company document:', error);
      toast.error('Erro ao criar documento da empresa');
      return false;
    }
  };

  const updateDocument = async (
    documentId: string,
    name: string,
    description: string,
    documentType: CompanyDocumentType,
    selectedJobRoles: string[] = [],
    selectedUsers: string[] = [],
    thumbnailPath?: string | null
  ): Promise<boolean> => {
    try {
      console.log('[CompanyDocuments] Iniciando atualização:', {
        documentId,
        selectedJobRoles: selectedJobRoles.length,
        selectedUsers: selectedUsers.length,
        isPublic: selectedJobRoles.length === 0 && selectedUsers.length === 0
      });

      // Preparar dados de atualização
      const updateData: any = {
        name,
        description,
        document_type: documentType
      };

      // Se thumbnailPath foi fornecido (incluindo null para remover), atualizar
      if (thumbnailPath !== undefined) {
        updateData.thumbnail_path = thumbnailPath;
      }

      // Atualizar documento
      const { error: docError } = await supabase
        .from('company_documents')
        .update(updateData)
        .eq('id', documentId);

      if (docError) {
        console.error('[CompanyDocuments] Erro ao atualizar documento:', docError);
        toast.error('Erro ao atualizar documento', {
          description: docError.message || 'Verifique suas permissões'
        });
        return false;
      }

      // Verificar vínculos existentes antes de remover
      const { data: existingRoles } = await supabase
        .from('company_document_job_roles')
        .select('id, job_role_id')
        .eq('company_document_id', documentId);
      
      const { data: existingUsers } = await supabase
        .from('company_document_users')
        .select('id, user_id')
        .eq('company_document_id', documentId);

      console.log('[CompanyDocuments] Vínculos existentes antes da remoção:', {
        roles: existingRoles?.length || 0,
        users: existingUsers?.length || 0,
        roleIds: existingRoles?.map(r => r.job_role_id) || [],
        userIds: existingUsers?.map(u => u.user_id) || []
      });

      // Remover vínculos existentes (sempre remover, mesmo que vá adicionar novos)
      console.log('[CompanyDocuments] Removendo vínculos existentes...');
      
      const { error: deleteRolesError, count: deletedRolesCount } = await supabase
        .from('company_document_job_roles')
        .delete()
        .eq('company_document_id', documentId)
        .select('*', { count: 'exact', head: true });

      if (deleteRolesError) {
        console.error('[CompanyDocuments] Erro ao remover vínculos de cargos:', deleteRolesError);
        toast.error('Erro ao remover vínculos de cargos', {
          description: deleteRolesError.message || 'Verifique suas permissões de administrador'
        });
        return false;
      }

      console.log('[CompanyDocuments] Vínculos de cargos removidos:', deletedRolesCount);

      const { error: deleteUsersError, count: deletedUsersCount } = await supabase
        .from('company_document_users')
        .delete()
        .eq('company_document_id', documentId)
        .select('*', { count: 'exact', head: true });

      if (deleteUsersError) {
        console.error('[CompanyDocuments] Erro ao remover vínculos de usuários:', deleteUsersError);
        toast.error('Erro ao remover vínculos de usuários', {
          description: deleteUsersError.message || 'Verifique suas permissões de administrador'
        });
        return false;
      }

      console.log('[CompanyDocuments] Vínculos de usuários removidos:', deletedUsersCount);

      // Vincular aos novos cargos se especificado
      if (selectedJobRoles.length > 0) {
        console.log('[CompanyDocuments] Adicionando vínculos de cargos:', selectedJobRoles);
        const roleLinks = selectedJobRoles.map(roleId => ({
          company_document_id: documentId,
          job_role_id: roleId
        }));

        const { error: roleError } = await supabase
          .from('company_document_job_roles')
          .insert(roleLinks);

        if (roleError) {
          console.error('[CompanyDocuments] Erro ao vincular cargos:', roleError);
          toast.error('Erro ao vincular cargos', {
            description: roleError.message || 'Verifique suas permissões'
          });
          return false;
        }
      } else {
        console.log('[CompanyDocuments] Nenhum cargo selecionado - documento será público');
      }

      // Vincular aos novos usuários se especificado
      if (selectedUsers.length > 0) {
        console.log('[CompanyDocuments] Adicionando vínculos de usuários:', selectedUsers);
        const userLinks = selectedUsers.map(userId => ({
          company_document_id: documentId,
          user_id: userId
        }));

        const { error: userError } = await supabase
          .from('company_document_users')
          .insert(userLinks);

        if (userError) {
          console.error('[CompanyDocuments] Erro ao vincular usuários:', userError);
          toast.error('Erro ao vincular usuários', {
            description: userError.message || 'Verifique suas permissões'
          });
          return false;
        }
      } else {
        console.log('[CompanyDocuments] Nenhum usuário selecionado - documento será público');
      }

      // Verificar se os vínculos foram realmente removidos/adicionados
      const { data: remainingRoles, error: checkRolesError } = await supabase
        .from('company_document_job_roles')
        .select('id')
        .eq('company_document_id', documentId);

      const { data: remainingUsers, error: checkUsersError } = await supabase
        .from('company_document_users')
        .select('id')
        .eq('company_document_id', documentId);

      if (checkRolesError || checkUsersError) {
        console.warn('[CompanyDocuments] Erro ao verificar vínculos após atualização:', {
          rolesError: checkRolesError,
          usersError: checkUsersError
        });
      } else {
        console.log('[CompanyDocuments] Verificação pós-atualização:', {
          rolesCount: remainingRoles?.length || 0,
          usersCount: remainingUsers?.length || 0,
          expectedRoles: selectedJobRoles.length,
          expectedUsers: selectedUsers.length,
          isPublic: (remainingRoles?.length || 0) === 0 && (remainingUsers?.length || 0) === 0
        });
      }

      console.log('[CompanyDocuments] Atualização concluída com sucesso');
      
      // Aguardar um pouco para garantir que as mudanças sejam commitadas
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verificar se as mudanças foram aplicadas
      let retries = 0;
      const maxRetries = 3;
      let rolesMatch = false;
      let usersMatch = false;
      
      while (retries < maxRetries && (!rolesMatch || !usersMatch)) {
        const { data: verifyRoles } = await supabase
          .from('company_document_job_roles')
          .select('id')
          .eq('company_document_id', documentId);
        
        const { data: verifyUsers } = await supabase
          .from('company_document_users')
          .select('id')
          .eq('company_document_id', documentId);
        
        rolesMatch = (verifyRoles?.length || 0) === selectedJobRoles.length;
        usersMatch = (verifyUsers?.length || 0) === selectedUsers.length;
        
        console.log('[CompanyDocuments] Verificação (tentativa', retries + 1, '):', {
          rolesCount: verifyRoles?.length || 0,
          usersCount: verifyUsers?.length || 0,
          expectedRoles: selectedJobRoles.length,
          expectedUsers: selectedUsers.length,
          rolesMatch,
          usersMatch
        });
        
        if (!rolesMatch || !usersMatch) {
          retries++;
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      
      // Forçar refresh dos documentos (sem cache) - limpa estado e busca novamente
      console.log('[CompanyDocuments] Forçando refresh completo dos documentos...');
      await fetchDocuments(true);
      
      toast.success('Documento atualizado com sucesso');
      
      return true;
    } catch (error) {
      console.error('[CompanyDocuments] Erro inesperado ao atualizar documento:', error);
      toast.error('Erro ao atualizar documento', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
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

      // Deletar vínculos com usuários
      await supabase
        .from('company_document_users')
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
    if (isAdmin && userProfile?.id === documentToCheck.created_by) return true;
    return false;
  };

  useEffect(() => {
    // Só buscar documentos quando tanto a empresa quanto o userProfile estiverem disponíveis
    if (selectedCompany?.id && userProfile?.id) {
      fetchDocuments();
    } else if (!selectedCompany?.id) {
      // Limpar documentos se não houver empresa selecionada
      setDocuments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany?.id, userProfile?.id, isAdmin]);

  return {
    documents,
    isLoading,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    previewDocument,
    canDeleteDocument,
    refetch: fetchDocuments
  };
};
