
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentValidation = () => {
  const checkBucketExists = async () => {
    try {
      console.log("Verificando se o bucket 'documents' existe...");
      
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
    } catch (err) {
      console.error("Erro ao verificar storage bucket:", err);
      return false;
    }
  };

  const createBucket = async () => {
    try {
      console.log("Criando bucket 'documents'...");
      
      const { error } = await supabase.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
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

  // Create bucket if it doesn't exist
  const createBucketIfNotExists = useCallback(async () => {
    return await checkBucketExists();
  }, []);

  return { checkBucketExists, createBucketIfNotExists };
};
