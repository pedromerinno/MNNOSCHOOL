
import { supabase } from "@/integrations/supabase/client";

export const deleteOldAvatar = async (avatarUrl: string) => {
  if (!avatarUrl || avatarUrl.includes('pravatar.cc')) {
    console.log('[Storage] Pulando exclusão - URL inválida ou padrão:', avatarUrl);
    return;
  }
  
  try {
    // Extract file name from URL - handle both old and new formats
    const urlParts = avatarUrl.split('/');
    let fileName = urlParts.pop();
    
    // If the URL contains the user folder structure, get just the filename
    if (fileName && fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
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
    
    console.log('[Storage] === INÍCIO UPLOAD ===');
    console.log('[Storage] Bucket: avatars');
    console.log('[Storage] Arquivo:', fileName);
    console.log('[Storage] Tamanho:', file.size, 'bytes');
    console.log('[Storage] Tipo:', file.type);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Allow overwrite
      });
    
    if (error) {
      console.error('[Storage] ❌ Erro no upload:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }
    
    console.log('[Storage] ✅ Upload bem-sucedido, dados:', data);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('[Storage] 🔗 URL pública gerada:', publicUrl);
    
    // Verificar se o arquivo foi realmente salvo
    const { data: fileList, error: listError } = await supabase.storage
      .from('avatars')
      .list('', { search: fileName.split('.')[0] });
    
    if (listError) {
      console.error('[Storage] ❌ Erro ao verificar arquivo:', listError);
    } else {
      console.log('[Storage] ✅ Arquivo encontrado na verificação:', fileList?.length > 0);
      if (fileList && fileList.length > 0) {
        console.log('[Storage] 📁 Arquivos encontrados:', fileList.map(f => f.name));
      }
    }
    
    // Test if the URL is accessible
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      console.log('[Storage] 🌐 Teste de acesso à URL - Status:', response.status);
    } catch (fetchError) {
      console.error('[Storage] ❌ Erro ao testar URL:', fetchError);
    }
    
    console.log('[Storage] === FIM UPLOAD ===');
    return publicUrl;
    
  } catch (error: any) {
    console.error('[Storage] ❌ Erro completo no upload:', error);
    throw error;
  }
};
