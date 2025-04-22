
import { useState } from 'react';
import { DocumentType } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useStorageOperations } from './useStorageOperations';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

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

      const targetUserId = params?.userId || user.id;
      let targetCompanyId = params?.companyId;

      if (!targetCompanyId) {
        // Buscar empresa do usuário se não fornecida
        const { data: userCompany } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .eq('user_id', user.id)
          .single();

        if (!userCompany) throw new Error("Empresa não encontrada");
        targetCompanyId = userCompany.empresa_id;
      }

      // Upload do arquivo
      const filePath = await uploadToStorage(file);
      if (!filePath) throw new Error("Falha no upload do arquivo");

      // Criar registro do documento
      const { error: insertError } = await supabase
        .from('user_documents')
        .insert({
          user_id: targetUserId,
          company_id: targetCompanyId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: user.id
        });

      if (insertError) throw insertError;

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
