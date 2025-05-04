
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument } from "@/types/document";
import { useDocumentValidation } from './useDocumentValidation';
import { DOCUMENTS_BUCKET } from './constants';

export const useDocumentDownload = () => {
  const { ensureBucketExists } = useDocumentValidation();

  const downloadDocument = useCallback(async (document: UserDocument): Promise<void> => {
    try {
      console.log("Iniciando download do documento:", document.id);
      
      // Garantir que o bucket existe antes de tentar download
      const bucketExists = await ensureBucketExists();
      
      if (!bucketExists) {
        console.error("Bucket não existe ou não pôde ser criado");
        throw new Error("Sistema de armazenamento não está disponível");
      }
      
      const { data, error } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .download(document.file_path);
        
      if (error) {
        console.error("Download error:", error);
        
        if (error.message.includes("permission denied")) {
          throw new Error("Você não tem permissão para baixar este documento");
        } else if (error.message.includes("not found")) {
          throw new Error("Arquivo não encontrado no storage");
        } else {
          throw error;
        }
      }
      
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log("Download concluído com sucesso!");
    } catch (error: any) {
      console.error('Error downloading document:', error);
      
      if (error.message.includes("storage/object-not-found")) {
        toast.error("Arquivo não encontrado. Pode ter sido excluído.");
      } else {
        toast.error(`Erro ao baixar documento: ${error.message}`);
      }
    }
  }, [ensureBucketExists]);

  return { downloadDocument };
};
