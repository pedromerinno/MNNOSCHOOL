
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
        throw new Error("Falha ao configurar sistema de armazenamento");
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
      
      return await uploadWithRetry();
    } catch (error: any) {
      console.error("Error in uploadToStorage:", error);
      throw error;
    }
  };

  const deleteFromStorage = async (filePath: string): Promise<boolean> => {
    if (!filePath) {
      console.warn("Caminho do arquivo não fornecido para exclusão");
      return false;
    }

    try {
      console.log(`Iniciando remoção do arquivo: ${filePath}`);
      
      // Verificar se o bucket existe
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        console.warn("Bucket 'documents' não encontrado ou não foi possível criar. Verifique se ele foi criado no Supabase.");
        return false;
      }
      
      // Verificar se o arquivo existe antes de tentar excluir
      const folderPath = filePath.split('/').slice(0, -1).join('/');
      const fileName = filePath.split('/').pop() || '';
      
      console.log(`Verificando se o arquivo existe em: ${folderPath}, arquivo: ${fileName}`);
      
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('documents')
          .list(folderPath, { search: fileName });
          
        if (listError) {
          console.error("Erro ao listar arquivos:", listError);
          // Continuar mesmo com erro
        } else {
          const fileExists = files && files.some(file => file.name === fileName);
          if (!fileExists) {
            console.warn(`Arquivo ${fileName} não encontrado no storage.`);
            return true; // Consideramos sucesso pois o arquivo já não existe
          }
        }
      } catch (listErr) {
        console.warn("Erro ao verificar existência do arquivo:", listErr);
        // Continuamos com a exclusão mesmo se não pudermos verificar
      }
      
      // Tentar remover o arquivo
      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);
      
      if (error) {
        // Se o erro for object not found, consideramos como sucesso
        if (error.message.includes('Object not found')) {
          console.log("Arquivo já não existe no storage.");
          return true;
        }
        
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
    if (!filePath) return false;
    
    try {
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        console.warn("Bucket 'documents' não encontrado ao verificar existência do arquivo.");
        return false;
      }
      
      const folderPath = filePath.split('/').slice(0, -1).join('/');
      const fileName = filePath.split('/').pop() || '';
      
      const { data, error } = await supabase.storage
        .from('documents')
        .list(folderPath, { search: fileName });
      
      if (error) {
        console.error("Erro ao verificar existência do arquivo:", error);
        return false;
      }
      
      return data && data.some(file => file.name === fileName);
    } catch (err) {
      console.error("Erro ao verificar existência do arquivo:", err);
      return false;
    }
  };

  return { uploadToStorage, deleteFromStorage, fileExists };
};
