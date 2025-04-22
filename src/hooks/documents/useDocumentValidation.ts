
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentValidation = () => {
  /**
   * Verifica se o bucket 'documents' existe e tenta criá-lo se não existir
   */
  const checkBucketExists = async () => {
    try {
      console.log("Verificando se o bucket 'documents' existe...");
      
      // Lista todos os buckets para verificar se 'documents' existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Erro ao listar buckets:", listError);
        return false;
      }
      
      const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
      
      if (documentsBucket) {
        console.log("Bucket 'documents' encontrado!");
        return true;
      }
      
      console.log("Bucket 'documents' não encontrado. Tentando criar...");
      return await createBucket();
    } catch (err) {
      console.error("Erro ao verificar storage bucket:", err);
      return false;
    }
  };

  /**
   * Cria o bucket 'documents' no storage do Supabase
   */
  const createBucket = async () => {
    try {
      console.log("Criando bucket 'documents'...");
      
      // Tentar várias vezes a criação do bucket, em caso de falha
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Tentativa ${attempts} de criar bucket...`);
        
        const { data, error } = await supabase.storage.createBucket('documents', {
          public: true, // Bucket público para facilitar o acesso aos arquivos
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (!error) {
          console.log("Bucket 'documents' criado com sucesso!");
          return true;
        }
        
        // Se o erro for que o bucket já existe, consideramos um sucesso
        if (error.message.includes('already exists')) {
          console.log("Bucket 'documents' já existe!");
          return true;
        }
        
        console.error(`Tentativa ${attempts} falhou:`, error);
        
        // Aguardar um pouco antes de tentar novamente
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.error(`Falha após ${maxAttempts} tentativas de criar bucket`);
      return false;
    } catch (err) {
      console.error("Erro ao criar storage bucket:", err);
      return false;
    }
  };

  // Função auxiliar para garantir que o bucket existe
  const createBucketIfNotExists = useCallback(async () => {
    try {
      // Verificar se o bucket existe, e criar se não existir
      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        console.log("Tentando criar bucket novamente...");
        return await createBucket();
      }
      
      return bucketExists;
    } catch (error) {
      console.error("Erro ao verificar/criar bucket:", error);
      return false;
    }
  }, []);

  return { checkBucketExists, createBucketIfNotExists, createBucket };
};
