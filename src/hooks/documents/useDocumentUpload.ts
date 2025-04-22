
import { useState, useEffect } from 'react';
import { DocumentType, UserDocument } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDocumentPermissions } from './useDocumentPermissions';
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
        toast.error("Falha ao configurar sistema de armazenamento");
        return false;
      }

      // Fazer upload do arquivo para o storage
      console.log("Iniciando upload do arquivo...");
      
      // Criar um caminho único para o arquivo
      const userDir = `user-documents/${userId}`;
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const fileName = `${userDir}/${timestamp}-${uniqueId}.${fileExt}`;

      // Upload do arquivo para o storage com lógica de retry
      const uploadWithRetry = async (retries = 3): Promise<string> => {
        try {
          console.log(`Tentando upload de arquivo (tentativa ${4-retries}/3)...`);
          
          const { data, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
    
          if (uploadError) throw uploadError;
          
          console.log("Upload realizado com sucesso!");
          return fileName;
        } catch (err: any) {
          console.error("Erro de upload:", err);
          
          if (retries > 0 && (
            err.message.includes('timeout') || 
            err.message.includes('network') ||
            err.message.includes('failed')
          )) {
            console.log("Tentando novamente em 1 segundo...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await uploadWithRetry(retries - 1);
          }
          throw err;
        }
      };
      
      const filePath = await uploadWithRetry();
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
        errorMessage = "Falha ao configurar sistema de armazenamento";
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
