
import { supabase } from "@/integrations/supabase/client";

export const uploadAvatarImage = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('Iniciando upload de avatar para usuário:', userId);
    
    // Validar arquivo
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }
    
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      throw new Error('O arquivo deve ser uma imagem (JPEG, PNG ou WebP)');
    }
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
    
    console.log('Nome do arquivo gerado:', fileName);
    
    // Upload para o bucket avatars
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw uploadError;
    }
    
    console.log('Upload realizado com sucesso:', uploadData);
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('URL pública gerada:', publicUrl);
    
    // Atualizar o perfil no banco imediatamente após o upload
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar: publicUrl })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Erro ao atualizar perfil no banco:', updateError);
      throw updateError;
    }
    
    console.log('Perfil atualizado no banco automaticamente com nova imagem');
    
    return publicUrl;
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    throw error;
  }
};
