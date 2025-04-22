
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
      
      try {
        const { data, error } = await supabase.storage.getBucket('documents');
        
        if (error) {
          if (error.message.includes('not found')) {
            console.log("Bucket 'documents' não encontrado. Tentando criar...");
            return await createBucket();
          }
          
          console.error("Erro ao verificar bucket:", error);
          return false;
        }
        
        console.log("Bucket 'documents' encontrado!");
        return true;
      } catch (error: any) {
        // Se ocorrer um erro ao verificar o bucket, tente criar de qualquer forma
        console.log("Erro ao verificar bucket. Tentando criar mesmo assim...");
        return await createBucket();
      }
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
      
      const { error } = await supabase.storage.createBucket('documents', {
        public: true, // Alterado para public: true para facilitar o acesso aos arquivos
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        // Se o erro for que o bucket já existe, consideramos um sucesso
        if (error.message.includes('already exists')) {
          console.log("Bucket 'documents' já existe!");
          return true;
        }
        
        console.error("Erro ao criar bucket:", error);
        toast.error("Falha ao configurar sistema de armazenamento");
        return false;
      }
      
      console.log("Bucket 'documents' criado com sucesso!");
      return true;
    } catch (err) {
      console.error("Erro ao criar storage bucket:", err);
      toast.error("Falha ao configurar sistema de armazenamento");
      return false;
    }
  };

  // Função auxiliar para garantir que o bucket existe
  const createBucketIfNotExists = useCallback(async () => {
    return await checkBucketExists();
  }, []);

  return { checkBucketExists, createBucketIfNotExists, createBucket };
};
