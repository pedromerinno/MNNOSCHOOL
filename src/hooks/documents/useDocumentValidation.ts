
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentValidation = () => {
  const checkBucketExists = async () => {
    try {
      console.log("Verificando se o bucket 'documents' existe...");
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error("Erro ao verificar buckets:", error);
        return false;
      }
      
      console.log("Buckets disponíveis:", buckets);
      
      const documentsBucket = buckets?.find(b => b.name === 'documents');
      
      if (!documentsBucket) {
        console.log("Bucket 'documents' não encontrado. Criando automaticamente...");
        return await createBucket();
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
      console.log("Iniciando criação do bucket 'documents'...");
      
      const { error: createError } = await supabase.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error("Erro ao criar bucket 'documents':", createError);
        
        // Try to create without options as a fallback
        console.log("Tentando criar bucket sem opções...");
        const { error: fallbackError } = await supabase.storage.createBucket('documents');
        
        if (fallbackError) {
          console.error("Falha também na criação sem opções:", fallbackError);
          toast.error("Não foi possível criar o armazenamento de documentos. Contate o administrador.");
          return false;
        }
      }
      
      console.log("Bucket 'documents' criado com sucesso!");
      return true;
    } catch (err) {
      console.error("Erro ao criar storage bucket:", err);
      return false;
    }
  };

  const createBucketIfNotExists = useCallback(async () => {
    return await checkBucketExists();
  }, []);

  return { checkBucketExists, createBucketIfNotExists, createBucket };
};
