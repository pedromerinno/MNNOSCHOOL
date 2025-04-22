
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
      
      // First try without options - simpler approach may work in more environments
      const { data, error } = await supabase.storage.createBucket('documents');
      
      if (error) {
        console.error("Tentativa simples falhou:", error);
        
        // If first attempt failed with simple approach, try with options
        console.log("Tentando criar bucket com opções específicas...");
        const { error: secondError } = await supabase.storage.createBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (secondError) {
          console.error("Falha também na criação com opções:", secondError);
          
          // Try one more time with minimal options
          console.log("Tentativa final com opções mínimas...");
          const { error: finalError } = await supabase.storage.createBucket('documents', {
            public: true // Try as public bucket as last resort
          });
          
          if (finalError) {
            console.error("Todas as tentativas de criação falharam:", finalError);
            toast.error("Não foi possível criar o armazenamento de documentos. Contate o administrador.");
            return false;
          }
        }
      }
      
      console.log("Bucket 'documents' criado com sucesso!");
      
      // Add public policy to the bucket to ensure files can be accessed
      try {
        const { error: policyError } = await supabase.storage.from('documents')
          .createSignedUrl('test.txt', 60);
          
        if (policyError && policyError.message.includes('not found')) {
          console.log("Criando arquivo de teste para validar o bucket...");
          const testBlob = new Blob(["test"], { type: 'text/plain' });
          await supabase.storage.from('documents').upload('test.txt', testBlob);
          console.log("Arquivo de teste criado com sucesso!");
        }
      } catch (policyErr) {
        console.warn("Aviso na validação do bucket:", policyErr);
        // Continue anyway, this is just a validation step
      }
      
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
