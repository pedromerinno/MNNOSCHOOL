
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStorageOperations = () => {
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      // Criar um caminho único para o arquivo
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      return filePath;
    } catch (error: any) {
      console.error("Erro no upload:", error);
      throw error;
    }
  };

  const deleteFromStorage = async (filePath: string): Promise<boolean> => {
    try {
      if (!filePath) {
        throw new Error("Caminho do arquivo não fornecido");
      }

      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir arquivo:", error);
      throw error;
    }
  };

  return { uploadToStorage, deleteFromStorage };
};
