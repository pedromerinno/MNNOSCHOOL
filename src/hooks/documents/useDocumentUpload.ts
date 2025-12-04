import { useState } from 'react';
import { DocumentType } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useStorageOperations } from './useStorageOperations';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';
import { DOCUMENTS_BUCKET } from './constants';
import { generateThumbnail } from '@/utils/thumbnailGenerator';

export const useDocumentUpload = (params?: { 
  userId?: string, 
  companyId?: string, 
  onUploadComplete?: () => void 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { uploadToStorage } = useStorageOperations();

  const validateFile = (file: File): boolean => {
    if (!file) {
      setFileError("Por favor, selecione um arquivo");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("O arquivo não pode ser maior que 10MB");
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.");
      return false;
    }

    setFileError(null);
    return true;
  };

  const canDeleteDocument = (document: any): boolean => {
    // Lógica para verificar se o usuário pode excluir o documento
    // Por padrão, permitir a exclusão de documentos carregados pelo próprio usuário
    return true;
  };

  const uploadDocument = async (
    file: File, 
    documentType: DocumentType, 
    description: string
  ): Promise<boolean> => {
    if (!validateFile(file)) return false;

    setIsUploading(true);
    try {
      // Get current user if not provided
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Se não foi fornecido um userId específico, usar o ID do usuário logado
      // Isso garante que documentos pessoais sejam criados com o user_id correto
      const targetUserId = params?.userId || user.id;
      
      // Garantir que o targetUserId seja válido
      if (!targetUserId) {
        throw new Error("ID do usuário não encontrado");
      }
      let targetCompanyId = params?.companyId;

      console.log('[DocumentUpload] IDs para upload:', {
        targetUserId,
        currentUserId: user.id,
        paramsUserId: params?.userId,
        targetCompanyId,
        paramsCompanyId: params?.companyId
      });

      if (!targetCompanyId) {
        // Tentar buscar empresa do localStorage primeiro (empresa selecionada)
        try {
          const storedCompanyId = localStorage.getItem('selectedCompanyId');
          if (storedCompanyId) {
            targetCompanyId = storedCompanyId;
          }
        } catch (e) {
          console.warn('Erro ao ler empresa do localStorage:', e);
        }

        // Se ainda não tiver, buscar empresa do usuário na tabela user_empresa
        if (!targetCompanyId) {
          const { data: userCompany, error: userCompanyError } = await supabase
            .from('user_empresa')
            .select('empresa_id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (userCompanyError && userCompanyError.code !== 'PGRST116') {
            // PGRST116 é "no rows returned", que é esperado em alguns casos
            console.error('Erro ao buscar empresa do usuário:', userCompanyError);
          }

          if (userCompany?.empresa_id) {
            targetCompanyId = userCompany.empresa_id;
          }
        }

        if (!targetCompanyId) {
          throw new Error("Empresa não encontrada. Por favor, selecione uma empresa no menu superior.");
        }
      }

      // Upload do arquivo
      const filePath = await uploadToStorage(file);
      if (!filePath) throw new Error("Falha no upload do arquivo");

      // Gerar e fazer upload do thumbnail
      let thumbnailPath = null;
      try {
        console.log('[DocumentUpload] ===== INÍCIO DA GERAÇÃO DE THUMBNAIL =====');
        console.log('[DocumentUpload] Arquivo:', file.name);
        console.log('[DocumentUpload] Tipo:', file.type);
        console.log('[DocumentUpload] Tamanho:', file.size, 'bytes');
        
        const thumbnailFile = await generateThumbnail(file);
        console.log('[DocumentUpload] Resultado da geração:', thumbnailFile ? 'SUCESSO' : 'FALHOU');
        
        if (thumbnailFile) {
          console.log('[DocumentUpload] Thumbnail gerado:', {
            name: thumbnailFile.name,
            size: thumbnailFile.size,
            type: thumbnailFile.type
          });
          
          const userDir = `user-documents/${targetUserId}`;
          const thumbnailFileName = `thumb_${Date.now()}.jpg`;
          thumbnailPath = `${userDir}/thumbnails/${thumbnailFileName}`;

          console.log('[DocumentUpload] Fazendo upload do thumbnail para:', thumbnailPath);
          const { data: uploadData, error: thumbnailError } = await supabase.storage
            .from('documents')
            .upload(thumbnailPath, thumbnailFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (thumbnailError) {
            console.error('[DocumentUpload] ERRO ao fazer upload do thumbnail:', thumbnailError);
            console.error('[DocumentUpload] Detalhes do erro:', {
              message: thumbnailError.message,
              statusCode: thumbnailError.statusCode,
              error: thumbnailError
            });
            // Não falhar o upload se o thumbnail falhar
            thumbnailPath = null;
          } else {
            console.log('[DocumentUpload] ✅ Thumbnail salvo com sucesso:', thumbnailPath);
            console.log('[DocumentUpload] Dados do upload:', uploadData);
          }
        } else {
          console.warn('[DocumentUpload] ⚠️ Thumbnail não foi gerado (tipo de arquivo não suportado ou erro na geração)');
        }
        console.log('[DocumentUpload] ===== FIM DA GERAÇÃO DE THUMBNAIL =====');
      } catch (error) {
        console.error('[DocumentUpload] ❌ EXCEÇÃO ao gerar thumbnail:', error);
        if (error instanceof Error) {
          console.error('[DocumentUpload] Mensagem:', error.message);
          console.error('[DocumentUpload] Stack:', error.stack);
        }
        // Não falhar o upload se o thumbnail falhar
        thumbnailPath = null;
      }

      // Criar registro do documento
      const documentData = {
        user_id: targetUserId,
        company_id: targetCompanyId,
        name: file.name,
        file_path: filePath,
        file_type: file.type,
        thumbnail_path: thumbnailPath,
        document_type: documentType,
        description: description || null,
        uploaded_by: user.id,
        attachment_type: 'file' as const
      };

      console.log('[DocumentUpload] Inserindo documento:', {
        user_id: documentData.user_id,
        company_id: documentData.company_id,
        name: documentData.name,
        uploaded_by: documentData.uploaded_by
      });

      const { data: insertedDocument, error: insertError } = await supabase
        .from('user_documents')
        .insert(documentData)
        .select()
        .single();

      if (insertError) {
        console.error('[DocumentUpload] Erro ao inserir documento:', insertError);
        throw insertError;
      }

      console.log('[DocumentUpload] Documento inserido com sucesso:', insertedDocument?.id);
      console.log('[DocumentUpload] Documento completo:', {
        id: insertedDocument?.id,
        name: insertedDocument?.name,
        thumbnail_path: insertedDocument?.thumbnail_path,
        file_path: insertedDocument?.file_path
      });

      toast.success('Documento enviado com sucesso');
      if (params?.onUploadComplete) {
        params.onUploadComplete();
      }
      return true;
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error(`Falha ao enviar documento: ${error.message}`);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Função para facilitar o uso em componentes
  const handleDocumentUpload = async (file: File, documentType: DocumentType, description: string) => {
    return await uploadDocument(file, documentType, description);
  };

  return {
    isUploading,
    fileError,
    setFileError,
    uploadDocument,
    uploadOpen,
    setUploadOpen,
    canDeleteDocument,
    handleDocumentUpload
  };
};
