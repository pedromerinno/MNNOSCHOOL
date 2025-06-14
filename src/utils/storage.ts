
import { supabase } from "@/integrations/supabase/client";

export const createAvatarsBucket = async () => {
  try {
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    });
    
    if (error && !error.message.includes('already exists')) {
      console.error('Error creating bucket:', error);
      throw error;
    }
    
    console.log('Avatars bucket created or already exists');
    return data;
  } catch (error) {
    console.error('Error in createAvatarsBucket:', error);
    throw error;
  }
};

export const deleteOldAvatar = async (avatarUrl: string) => {
  if (!avatarUrl || avatarUrl.includes('pravatar.cc')) return;
  
  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `avatars/${fileName}`;
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting old avatar:', error);
    } else {
      console.log('Old avatar deleted successfully');
    }
  } catch (error) {
    console.error('Error in deleteOldAvatar:', error);
  }
};
