
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBackgroundUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, type: 'video' | 'image') => {
    setIsUploading(true);
    try {
      console.log(`Uploading ${type} file:`, file.name);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('background-media')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('background-media')
        .getPublicUrl(filePath);

      console.log("File uploaded, public URL:", publicUrl);

      return publicUrl;
    } catch (error: any) {
      toast.error(`Erro ao fazer upload: ${error.message}`);
      console.error('Erro no upload:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
