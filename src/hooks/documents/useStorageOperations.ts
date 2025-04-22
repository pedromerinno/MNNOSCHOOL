
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
      // Verificar se o bucket existe antes de tentar o upload
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        console.error("Falha ao verificar/criar o bucket de documentos");
        throw new Error("Não foi possível configurar o armazenamento de documentos");
      }
      
      console.log("Bucket verificado/criado com sucesso, prosseguindo com upload...");
      
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
    
          if (uploadError) {
            console.error("Erro de upload:", uploadError);
            
            if (retries > 0 && (
              uploadError.message.includes('timeout') || 
              uploadError.message.includes('network') ||
              uploadError.message.includes('failed')
            )) {
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
      
      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);
      
      if (error) {
        console.error("Erro ao remover arquivo:", error);
        return false;
      }
      
      console.log("Arquivo removido com sucesso!");
      return true;
    } catch (err) {
      console.error("Erro em deleteFromStorage:", err);
      return false;
    }
  };

  // Método para verificar se um arquivo existe
  const fileExists = async (filePath: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop() || ''
        });
      
      if (error) {
        console.error("Erro ao verificar existência do arquivo:", error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (err) {
      console.error("Erro ao verificar existência do arquivo:", err);
      return false;
    }
  };

  return { uploadToStorage, deleteFromStorage, fileExists };
};
