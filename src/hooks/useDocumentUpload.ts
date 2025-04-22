
import { useState, useEffect } from 'react';
import { DocumentType } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './documents/constants';

// Make these constants available for import
export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };

// Add optional parameters to make the hook more flexible
export const useDocumentUpload = (params?: { userId?: string, companyId?: string, onUploadComplete?: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchCurrentUser();
  }, []);

  const validateFile = (file: File | null): boolean => {
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

  const uploadDocument = async (file: File, documentType: DocumentType, description: string) => {
    if (!validateFile(file)) return false;

    const targetUserId = params?.userId;
    const targetCompanyId = params?.companyId;
    
    if (!targetUserId || !targetCompanyId) {
      toast.error('Informações insuficientes para upload (usuário ou empresa ausente)');
      return false;
    }

    setIsUploading(true);
    setFileError(null);

    try {
      // Upload file to storage
      const userDir = `user-documents/${targetUserId}`;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get current authenticated user (the admin user doing the upload)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Insert document record
      const { error } = await supabase
        .from('user_documents')
        .insert({
          user_id: targetUserId,
          company_id: targetCompanyId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: user.id // The admin user is the uploader
        });

      if (error) throw error;

      toast.success('Documento enviado com sucesso');
      
      // Call onUploadComplete if provided
      if (params?.onUploadComplete) {
        params.onUploadComplete();
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro no upload do documento:', error);
      
      if (error.message.includes("storage/bucket-not-found")) {
        toast.error("Sistema de armazenamento não está disponível. Contate o administrador.");
      } else if (error.message.includes("new row violates row-level security policy")) {
        toast.error("Erro de permissão. Verifique se você tem direitos administrativos para esta ação.");
      } else {
        toast.error(`Erro: ${error.message}`);
      }
      
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    fileError,
    setFileError,
    uploadDocument,
    validateFile
  };
};
