
import { useState, useEffect } from 'react';
import { DocumentType, UserDocument } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDocumentPermissions } from './useDocumentPermissions';
import { useUploadValidation } from './useUploadValidation';
import { useStorageOperations } from './useStorageOperations';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

// Make these constants available for import
export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };

// Add optional parameters to make the hook more flexible
export const useDocumentUpload = (params?: { userId?: string, companyId?: string, onUploadComplete?: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { canDeleteDocument } = useDocumentPermissions(currentUserId);
  const { validateUpload } = useUploadValidation();
  const { uploadToStorage } = useStorageOperations();

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

    // Use provided userId or fetch it
    let userId = params?.userId;
    let companyId = params?.companyId;
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    
    if (!companyId && !params?.companyId) {
      const { data: userData } = await supabase.auth.getUser();
      const { data: userCompanies } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', userData.user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      companyId = userCompanies?.empresa_id;
    }
    
    if (!userId || !companyId) {
      toast.error('Informações insuficientes para upload');
      return false;
    }

    setIsUploading(true);
    setFileError(null);

    try {
      const filePath = await uploadToStorage(userId, file);

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
          uploaded_by: userId
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
      toast.error(`Erro: ${error.message}`);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: DocumentType, description: string) => {
    return await uploadDocument(file, documentType, description);
  };

  return {
    isUploading,
    uploadOpen,
    setUploadOpen,
    fileError,
    setFileError,
    uploadDocument,
    validateFile,
    canDeleteDocument,
    handleDocumentUpload
  };
};
