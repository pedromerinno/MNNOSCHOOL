
import { supabase } from "@/integrations/supabase/client";

export const deleteOldAvatar = async (avatarUrl: string) => {
  if (!avatarUrl || avatarUrl.includes('pravatar.cc')) return;
  
  try {
    // Extract file name from URL
    const fileName = avatarUrl.split('/').pop();
    if (!fileName) return;
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);
    
    if (error) {
      console.error('Error deleting old avatar:', error);
    } else {
      console.log('Old avatar deleted successfully');
    }
  } catch (error) {
    console.error('Error in deleteOldAvatar:', error);
  }
};

export const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    console.log('Uploading avatar to:', fileName);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('Avatar uploaded successfully:', publicUrl);
    return publicUrl;
    
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};
