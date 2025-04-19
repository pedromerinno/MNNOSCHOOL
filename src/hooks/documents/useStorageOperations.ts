
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStorageOperations = () => {
  const uploadToStorage = async (userId: string, file: File) => {
    const userDir = `user-documents/${userId}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;
    return fileName;
  };

  return { uploadToStorage };
};
