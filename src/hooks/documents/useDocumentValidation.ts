
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentValidation = () => {
  const checkBucketExists = async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error("Erro ao verificar buckets:", error);
        return false;
      }
      
      const documentsBucket = buckets?.find(b => b.name === 'documents');
      
      if (!documentsBucket) {
        console.log("Bucket 'documents' não encontrado. Criando automaticamente...");
        
        // Attempt to create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error("Erro ao criar bucket 'documents':", createError);
          toast.error("Não foi possível criar o armazenamento de documentos. Contate o administrador.");
          return false;
        }
        
        console.log("Bucket 'documents' criado com sucesso!");
        toast.success("Armazenamento de documentos criado com sucesso!");
        return true;
      }
      
      return true;
    } catch (err) {
      console.error("Erro ao verificar storage bucket:", err);
      return false;
    }
  };

  const createBucketIfNotExists = async () => {
    // First check if bucket exists
    const bucketExists = await checkBucketExists();
    
    if (!bucketExists) {
      // Try to create the bucket
      try {
        const { error } = await supabase.storage.createBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) {
          console.error("Erro ao criar bucket 'documents':", error);
          return false;
        }
        
        console.log("Bucket 'documents' criado com sucesso!");
        return true;
      } catch (err) {
        console.error("Erro ao criar storage bucket:", err);
        return false;
      }
    }
    
    return bucketExists;
  };

  return { checkBucketExists, createBucketIfNotExists };
};
