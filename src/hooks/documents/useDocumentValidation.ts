
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentValidation = () => {
  /**
   * Verifica se o bucket 'documents' existe e tenta criá-lo se não existir
   */
  const checkBucketExists = useCallback(async () => {
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
  }, []);

  /**
   * Cria o bucket 'documents' no storage do Supabase
   */
  const createBucket = useCallback(async () => {
    try {
      console.log("Criando bucket 'documents'...");
      
      // Usar auth.getSession para obter o token de autenticação
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error("Usuário não autenticado para criar bucket");
        toast.error("Você precisa estar autenticado para realizar esta operação");
        return false;
      }

      // Tentar criar o bucket com configurações adequadas
      const { error } = await supabase.storage.createBucket('documents', {
        public: true, // Bucket público para facilitar o acesso aos arquivos
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png'
        ]
      });
      
      if (error) {
        // Verificar se o erro é porque o bucket já existe
        if (error.message.includes('already exists')) {
          console.log("Bucket 'documents' já existe!");
          return true;
        }
        
        if (error.message.includes('row-level security policy')) {
          console.error("Erro de permissão ao criar bucket:", error);
          toast.error("Você não tem permissão para criar buckets. Contate o administrador.");
        } else {
          console.error("Erro ao criar bucket:", error);
          toast.error("Erro ao configurar sistema de armazenamento");
        }
        
        return false;
      }
      
      console.log("Bucket 'documents' criado com sucesso!");
      return true;
    } catch (err) {
      console.error("Erro ao criar storage bucket:", err);
      return false;
    }
  }, []);

  const ensureBucketExists = useCallback(async () => {
    const exists = await checkBucketExists();
    if (!exists) {
      const created = await createBucket();
      if (!created) {
        toast.error("Falha ao configurar sistema de armazenamento");
        console.error("Não foi possível criar o bucket 'documents'");
        return false;
      }
    }
    return true;
  }, [checkBucketExists, createBucket]);

  // Add createBucketIfNotExists as an alias to ensureBucketExists for backward compatibility
  const createBucketIfNotExists = ensureBucketExists;

  return { 
    checkBucketExists, 
    createBucket, 
    ensureBucketExists,
    createBucketIfNotExists
  };
};
