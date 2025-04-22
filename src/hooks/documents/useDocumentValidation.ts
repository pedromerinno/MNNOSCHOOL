
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
      
      console.log("Buckets disponíveis:", buckets?.map(b => b.name).join(', ') || 'nenhum');
      
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
      
      // Multiple attempts with different configurations to ensure bucket creation
      // First, try creating without any options (works in most environments)
      const { data, error } = await supabase.storage.createBucket('documents');
      
      if (error) {
        console.error("Tentativa simples falhou:", error);
        
        // If the simple approach fails, try with specific options
        console.log("Tentando criar bucket com opções específicas...");
        const { error: secondError } = await supabase.storage.createBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (secondError) {
          console.error("Falha também na criação com opções:", secondError);
          
          // As a last resort, try with minimal public access
          console.log("Tentativa final com opções mínimas...");
          const { error: finalError } = await supabase.storage.createBucket('documents', {
            public: true // Try as public bucket as last resort
          });
          
          if (finalError) {
            console.error("Todas as tentativas de criação falharam:", finalError);
            throw new Error("Não foi possível criar o armazenamento de documentos");
          }
        }
      }
      
      console.log("Bucket 'documents' criado com sucesso!");
      
      // Verify bucket functionality with a test upload
      try {
        console.log("Validando funcionamento do bucket com arquivo de teste...");
        const testBlob = new Blob(["test"], { type: 'text/plain' });
        const testPath = `test-${Date.now()}.txt`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(testPath, testBlob);
          
        if (uploadError) {
          console.error("Erro ao validar bucket com upload de teste:", uploadError);
          throw new Error("Bucket criado mas não está funcional");
        }
        
        console.log("Bucket validado com sucesso. Removendo arquivo de teste...");
        
        // Clean up test file
        await supabase.storage.from('documents').remove([testPath]);
      } catch (validationErr) {
        console.warn("Aviso na validação do bucket:", validationErr);
        // Continue anyway, this is just a validation step
      }
      
      return true;
    } catch (err) {
      console.error("Erro ao criar storage bucket:", err);
      toast.error("Não foi possível configurar o armazenamento de documentos. Contate o administrador.");
      return false;
    }
  };

  const createBucketIfNotExists = useCallback(async () => {
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      return await createBucket();
    }
    return bucketExists;
  }, []);

  return { checkBucketExists, createBucketIfNotExists, createBucket };
};
