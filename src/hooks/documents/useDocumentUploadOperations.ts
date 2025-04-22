
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentType, UserDocument } from "@/types/document";
import { useUploadValidation } from './useUploadValidation';
import { useStorageOperations } from './useStorageOperations';

export const useDocumentUploadOperations = (
  userId: string | null,
  companyId: string | null,
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>,
  setIsUploading: (loading: boolean) => void
) => {
  const { validateUpload } = useUploadValidation();
  const { uploadToStorage } = useStorageOperations();

  const uploadDocument = useCallback(async (
    file: File, 
    documentType: DocumentType, 
    description?: string
  ): Promise<UserDocument | null> => {
    if (!validateUpload(file, userId, companyId)) {
      return null;
    }

    setIsUploading(true);
    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return null;
      }

      console.log("Iniciando upload do arquivo para o storage...");
      
      // Upload the file to storage
      const filePath = await uploadToStorage(userId!, file);

      console.log("Arquivo enviado com sucesso. Salvando registro no banco de dados...");
      
      // Create the document record in the database
      const { data, error } = await supabase
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
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar registro do documento:", error);
        throw error;
      }

      console.log("Registro do documento criado com sucesso!");
      
      const newDoc = data as UserDocument;
      setDocuments(prev => [...prev, newDoc]);
      toast.success('Documento enviado com sucesso');
      return newDoc;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      let errorMessage = 'Erro ao enviar documento';
      
      if (error.message.includes("storage/bucket-not-found")) {
        errorMessage = "Armazenamento não configurado. Contate o administrador.";
      } else if (error.message.includes("already exists")) {
        errorMessage = "Um arquivo com este nome já existe. Tente novamente.";
      } else if (error.message.includes("permission denied")) {
        errorMessage = "Você não tem permissão para fazer upload desse arquivo.";
      } else {
        errorMessage = `Erro no upload: ${error.message}`;
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [
    userId, 
    companyId, 
    setDocuments, 
    setIsUploading, 
    validateUpload, 
    uploadToStorage
  ]);

  return { uploadDocument };
};
