
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

      // First check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      
      // If the bucket doesn't exist yet, create it
      if (!buckets?.find(bucket => bucket.name === 'background-media')) {
        console.log("Creating background-media bucket");
        const { error: bucketError } = await supabase.storage.createBucket('background-media', {
          public: true
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          throw bucketError;
        }
      }

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
