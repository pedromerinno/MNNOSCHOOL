
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

      const { error: uploadError, data } = await supabase.storage
        .from('background-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('background-media')
        .getPublicUrl(fileName);

      console.log("File uploaded successfully, public URL:", publicUrl);

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
