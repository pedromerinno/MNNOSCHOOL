
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDocumentValidation } from "./useDocumentValidation";

export const useStorageOperations = () => {
  const [bucketReady, setBucketReady] = useState(false);
  const { ensureBucketExists } = useDocumentValidation();

  // Verificar se o bucket existe quando o hook é inicializado
  useEffect(() => {
    const checkBucket = async () => {
      const ready = await ensureBucketExists();
      setBucketReady(ready);
    };
    
    checkBucket();
  }, [ensureBucketExists]);

  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      // Verificar se o bucket está pronto
      if (!bucketReady) {
        const ready = await ensureBucketExists();
        if (!ready) {
          throw new Error("Sistema de armazenamento não está configurado");
        }
        setBucketReady(ready);
      }

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Criar um caminho único para o arquivo
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log("Iniciando upload do arquivo para:", filePath);

      // Fazer upload do arquivo para o bucket
      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload concluído com sucesso:", filePath);
      return filePath;
    } catch (error: any) {
      console.error("Erro no upload:", error);
      
      // Exibir mensagens de erro mais específicas baseadas no erro
      if (error.message.includes("storage/bucket-not-found")) {
        toast.error("Bucket de armazenamento não encontrado");
      } else if (error.message.includes("new row violates row-level security policy")) {
        toast.error("Erro de permissão para upload de arquivos");
      } else if (error.message.includes("storage/object-not-found")) {
        toast.error("Caminho do arquivo inválido");
      } else {
        toast.error(`Erro no upload: ${error.message}`);
      }
      
      return null;
    }
  };

  const deleteFromStorage = async (filePath: string): Promise<boolean> => {
    if (!filePath) {
      console.error("Caminho do arquivo não fornecido");
      return false;
    }
    
    try {
      // Verificar se o bucket está pronto
      if (!bucketReady) {
        const ready = await ensureBucketExists();
        if (!ready) {
          throw new Error("Sistema de armazenamento não está configurado");
        }
        setBucketReady(ready);
      }

      console.log("Tentando excluir arquivo:", filePath);
      
      // Remover o arquivo do bucket
      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (error) {
        throw error;
      }
      
      console.log("Arquivo excluído com sucesso:", filePath);
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir arquivo:", error);
      
      // Erro específico para caminho inválido
      if (error.message.includes("storage/object-not-found")) {
        console.warn("Arquivo não encontrado, considerando como já excluído:", filePath);
        return true; // Consideramos sucesso se o arquivo já não existir
      }
      
      toast.error(`Erro ao excluir arquivo: ${error.message}`);
      return false;
    }
  };

  return { uploadToStorage, deleteFromStorage, bucketReady };
};
