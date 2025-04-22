import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentValidation = () => {
  const checkBucketExists = async () => {
    try {
      console.log("Verificando se o bucket 'documents' existe...");
      
      const { data, error } = await supabase.storage.getBucket('documents');
      
      if (error) {
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

  // Simple wrapper function to keep the API consistent with the rest of the app
  const createBucketIfNotExists = useCallback(async () => {
    return await checkBucketExists();
  }, []);

  return { checkBucketExists, createBucketIfNotExists };
};
