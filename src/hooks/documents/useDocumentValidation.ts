
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentValidation = () => {
  const checkBucketExists = async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.warn("Erro ao verificar buckets:", error);
        return false;
      }
      
      const documentsBucket = buckets?.find(b => b.name === 'documents');
      
      if (!documentsBucket) {
        console.warn("Bucket 'documents' não encontrado. Verifique se ele foi criado no Supabase.");
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Erro ao verificar storage bucket:", err);
      return false;
    }
  };

  return { checkBucketExists };
};
