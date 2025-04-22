
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from './constants';
import { useDocumentValidation } from './useDocumentValidation';

export const useStorageOperations = () => {
  const { createBucketIfNotExists } = useDocumentValidation();
  
  const uploadToStorage = async (userId: string, file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }
    
    try {
      // First, ensure the bucket exists
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        console.error("Falha ao criar ou verificar bucket 'documents'");
        throw new Error("Sistema de armazenamento não está disponível. Por favor, tente novamente mais tarde.");
      }
      
      // Create a unique file path with timestamp to ensure uniqueness
      const userDir = `user-documents/${userId}`;
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const fileName = `${userDir}/${timestamp}-${uniqueId}.${fileExt}`;

      // Upload file to storage with retry logic
      const uploadWithRetry = async (retries = 2): Promise<string> => {
        try {
          console.log(`Tentando upload de arquivo (tentativa ${3-retries}/3)...`);
          
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
    
          if (uploadError) {
            console.error("Erro de upload:", uploadError);
            
            if (retries > 0 && (uploadError.message.includes('timeout') || uploadError.message.includes('network'))) {
              console.log("Tentando novamente em 1 segundo...");
              await new Promise(resolve => setTimeout(resolve, 1000));
              return await uploadWithRetry(retries - 1);
            }
            throw uploadError;
          }
          
          console.log("Upload realizado com sucesso!");
          return fileName;
        } catch (err) {
          if (retries > 0) {
            console.log("Tentando novamente o upload...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await uploadWithRetry(retries - 1);
          }
          throw err;
        }
      };
      
      return await uploadWithRetry();
    } catch (error: any) {
      console.error("Error in uploadToStorage:", error);
      throw error;
    }
  };

  const deleteFromStorage = async (filePath: string): Promise<boolean> => {
    try {
      console.log(`Iniciando remoção do arquivo: ${filePath}`);
      
      // Ensure bucket exists before attempting deletion
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        console.error("Bucket 'documents' não existe ou não foi possível criar");
        return false;
      }
      
      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);
      
      if (error) {
        console.error("Erro ao remover arquivo:", error);
        // Don't throw here - we'll still want to delete the database record
        // even if the file removal fails
        return false;
      }
      
      console.log("Arquivo removido com sucesso!");
      return true;
    } catch (err) {
      console.error("Erro em deleteFromStorage:", err);
      // Return false but don't throw - allow database record deletion to proceed
      return false;
    }
  };

  return { uploadToStorage, deleteFromStorage };
};
