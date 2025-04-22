
import { useState, useEffect } from 'react';
import { DocumentType, UserDocument } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDocumentPermissions } from './useDocumentPermissions';
import { useUploadValidation } from './useUploadValidation';
import { useStorageOperations } from './useStorageOperations';
import { useDocumentValidation } from './useDocumentValidation';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

// Make these constants available for import
export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };

// Adicionar parâmetros opcionais para tornar o hook mais flexível
export const useDocumentUpload = (params?: { 
  userId?: string, 
  companyId?: string, 
  onUploadComplete?: () => void 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { canDeleteDocument } = useDocumentPermissions(currentUserId);
  const { validateUpload } = useUploadValidation();
  const { uploadToStorage } = useStorageOperations();
  const { createBucketIfNotExists } = useDocumentValidation();

  // Buscar ID do usuário atual
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

    // Determinar o ID do usuário e da empresa
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
      // Criar o bucket se ele não existir
      console.log("Verificando/criando bucket de documentos...");
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        console.error("Falha ao criar/verificar bucket de documentos");
        toast.error("Não foi possível configurar o armazenamento de documentos. Contate o administrador.");
        return false;
      }

      // Fazer upload do arquivo para o storage
      console.log("Iniciando upload do arquivo...");
      const filePath = await uploadToStorage(userId, file);
      console.log("Arquivo enviado com sucesso para:", filePath);

      // Obter o usuário autenticado atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }

      // Criar o registro do documento no banco de dados
      console.log("Salvando registro do documento no banco de dados...");
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
          uploaded_by: user.id
        });

      if (error) {
        console.error("Erro ao criar registro do documento:", error);
        throw error;
      }

      console.log("Documento cadastrado com sucesso!");
      toast.success('Documento enviado com sucesso');
      
      // Chamar onUploadComplete se fornecido
      if (params?.onUploadComplete) {
        params.onUploadComplete();
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro no upload do documento:', error);
      
      let errorMessage = 'Erro ao enviar documento';
      
      if (error.message?.includes("storage/bucket-not-found")) {
        errorMessage = "Sistema de armazenamento não está disponível. Por favor, tente novamente mais tarde.";
      } else if (error.message?.includes("already exists")) {
        errorMessage = "Um arquivo com este nome já existe. Tente novamente.";
      } else if (error.message?.includes("permission denied")) {
        errorMessage = "Você não tem permissão para fazer upload desse arquivo.";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
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
