
import { useState } from 'react';
import { DocumentType } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

interface UseDocumentUploadProps {
  userId: string;
  companyId: string;
  onUploadComplete: () => void;
}

export const useDocumentUpload = ({ userId, companyId, onUploadComplete }: UseDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

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

    setIsUploading(true);
    setFileError(null);

    try {
      const userDir = `user-documents/${userId}`;
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

      const { error } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          company_id: companyId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || userId
        });

      if (error) throw error;

      toast.success('Documento enviado com sucesso');
      onUploadComplete();
      return true;
    } catch (error: any) {
      console.error('Erro no upload do documento:', error);
      toast.error(`Erro: ${error.message}`);
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
