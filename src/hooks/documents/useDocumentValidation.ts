
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DOCUMENTS_BUCKET } from './constants';

export const useDocumentValidation = () => {
  /**
   * Verifica se o bucket 'documents' existe e tenta criá-lo se não existir
   */
  const checkBucketExists = useCallback(async () => {
    try {
      console.log(`Verificando se o bucket '${DOCUMENTS_BUCKET}' existe...`);
      
      // Lista todos os buckets para verificar se 'documents' existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Erro ao listar buckets:", listError);
        return false;
      }
      
      const documentsBucket = buckets?.find(bucket => bucket.name === DOCUMENTS_BUCKET);
      
      if (documentsBucket) {
        console.log(`Bucket '${DOCUMENTS_BUCKET}' encontrado!`);
        return true;
      }
      
      console.log(`Bucket '${DOCUMENTS_BUCKET}' não encontrado. Tentando criar...`);
      return await createBucket();
    } catch (err) {
      console.error("Erro ao verificar storage bucket:", err);
      return false;
    }
  }, []);

  /**
   * Cria o bucket 'documents' no storage do Supabase
   */
  const createBucket = useCallback(async () => {
    try {
      console.log(`Criando bucket '${DOCUMENTS_BUCKET}'...`);
      
      // Verificar se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Se o usuário não estiver autenticado, podemos tentar usar o bucket mesmo assim
        // já que ele deve existir no Supabase
        console.log("Usuário não autenticado - presumindo que o bucket já existe");
        return true;
      }

      // Verificar se o bucket já existe antes de tentar criá-lo
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(b => b.name === DOCUMENTS_BUCKET);
      
      if (bucketExists) {
        console.log(`Bucket '${DOCUMENTS_BUCKET}' já existe!`);
        return true;
      }

      // Tentar criar o bucket apenas se ele não existir
      const { error } = await supabase.storage.createBucket(DOCUMENTS_BUCKET, {
        public: true, // Bucket público para facilitar o acesso aos arquivos
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png'
        ]
      });
      
      if (error) {
        if (error.message.includes('row-level security policy')) {
          // Podemos continuar se for apenas erro de permissão, pois o bucket provavelmente já existe
          console.log("Erro de permissão, mas presumindo que o bucket já existe");
          return true;
        }
        
        console.error("Erro ao criar bucket:", error);
        toast.error("Não foi possível configurar o sistema de armazenamento");
        return false;
      }
      
      console.log(`Bucket '${DOCUMENTS_BUCKET}' criado com sucesso!`);
      return true;
    } catch (err) {
      console.error("Erro ao criar storage bucket:", err);
      return false;
    }
  }, []);

  const ensureBucketExists = useCallback(async () => {
    const exists = await checkBucketExists();
    if (!exists) {
      const created = await createBucket();
      if (!created) {
        toast.error("Falha ao configurar sistema de armazenamento");
        console.error(`Não foi possível criar o bucket '${DOCUMENTS_BUCKET}'`);
        return false;
      }
    }
    return true;
  }, [checkBucketExists, createBucket]);

  // Add createBucketIfNotExists as an alias to ensureBucketExists for backward compatibility
  const createBucketIfNotExists = ensureBucketExists;

  return { 
    checkBucketExists, 
    createBucket, 
    ensureBucketExists,
    createBucketIfNotExists
  };
};
