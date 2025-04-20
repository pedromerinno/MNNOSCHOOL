
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBackgroundUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, type: 'video' | 'image') => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('background-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('background-media')
        .getPublicUrl(filePath);

      // Check if the settings entry already exists
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'login_background')
        .single();

      // Update settings table with new background
      // Make sure to use the correct upsert approach to avoid duplicate keys
      const { error: updateError } = await supabase
        .from('settings')
        .upsert({
          id: existingSettings?.id || undefined, // Only include ID if it exists
          key: 'login_background',
          value: publicUrl,
          media_type: type,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      toast.success('Background atualizado com sucesso');
      window.dispatchEvent(new Event('background-updated'));
      return publicUrl;
    } catch (error: any) {
      toast.error(`Erro ao fazer upload: ${error.message}`);
      console.error('Erro no upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
