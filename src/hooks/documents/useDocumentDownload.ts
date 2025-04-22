
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument } from "@/types/document";

export const useDocumentDownload = () => {
  const downloadDocument = useCallback(async (document: UserDocument): Promise<void> => {
    try {
      console.log("Iniciando download do documento:", document.id);
      
      const { data, error } = await supabase.storage
        .from('documents')
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
  }, []);

  return { downloadDocument };
};
