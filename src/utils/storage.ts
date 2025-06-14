
import { supabase } from "@/integrations/supabase/client";

export const deleteOldAvatar = async (avatarUrl: string) => {
  if (!avatarUrl || avatarUrl.includes('pravatar.cc')) {
    console.log('[Storage] Pulando exclusão - URL inválida ou padrão:', avatarUrl);
    return;
  }
  
  try {
    // Extract file name from URL
    const fileName = avatarUrl.split('/').pop();
    if (!fileName) {
      console.log('[Storage] Nome do arquivo não encontrado na URL:', avatarUrl);
      return;
    }
    
    console.log('[Storage] Tentando deletar arquivo:', fileName);
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);
    
    if (error) {
      console.error('[Storage] Erro ao deletar avatar antigo:', error);
    } else {
      console.log('[Storage] Avatar antigo deletado com sucesso:', fileName);
    }
  } catch (error) {
    console.error('[Storage] Erro em deleteOldAvatar:', error);
  }
};

export const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    console.log('[Storage] Iniciando upload para bucket avatars:', fileName);
    console.log('[Storage] Tamanho do arquivo:', file.size, 'bytes');
    console.log('[Storage] Tipo do arquivo:', file.type);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('[Storage] Erro no upload:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }
    
    console.log('[Storage] Upload bem-sucedido, dados:', data);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('[Storage] URL pública gerada:', publicUrl);
    
    // Verificar se o arquivo foi realmente salvo
    const { data: fileList, error: listError } = await supabase.storage
      .from('avatars')
      .list('', { search: fileName });
    
    if (listError) {
      console.error('[Storage] Erro ao verificar arquivo:', listError);
    } else {
      console.log('[Storage] Arquivo encontrado na verificação:', fileList?.length > 0);
    }
    
    return publicUrl;
    
  } catch (error: any) {
    console.error('[Storage] Erro completo no upload:', error);
    throw error;
  }
};
