
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
      
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true, // Bucket público para facilitar o acesso aos arquivos
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        // Se o erro for que o bucket já existe, consideramos um sucesso
        if (error.message.includes('already exists')) {
          console.log("Bucket 'documents' já existe!");
          return true;
        }
        
        console.error("Erro ao criar bucket:", error);
        return false;
      }
      
      console.log("Bucket 'documents' criado com sucesso!");
      return true;
    } catch (err) {
      console.error("Erro ao criar storage bucket:", err);
      return false;
    }
  };

  // Função auxiliar para garantir que o bucket existe
  const createBucketIfNotExists = useCallback(async () => {
    try {
      return await checkBucketExists();
    } catch (error) {
      console.error("Erro ao verificar/criar bucket:", error);
      return false;
    }
  }, []);

  return { checkBucketExists, createBucketIfNotExists, createBucket };
};
