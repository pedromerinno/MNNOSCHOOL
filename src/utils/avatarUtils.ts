/**
 * Utilitários para trabalhar com avatares de usuários
 */

/**
 * Valida se uma URL de avatar é válida e acessível
 */
export const isValidAvatarUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  // Verificar se é uma URL válida
  try {
    const urlObj = new URL(url);
    // Permitir http, https ou dados
    if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
      return false;
    }
    return true;
  } catch {
    // Se não for uma URL válida, verificar se é um caminho relativo válido
    return url.startsWith('/') || url.startsWith('./');
  }
};

/**
 * Obtém a URL do avatar com fallback
 */
export const getAvatarUrl = (
  avatarUrl: string | null | undefined,
  fallback: string = '/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png'
): string => {
  if (isValidAvatarUrl(avatarUrl)) {
    return avatarUrl!;
  }
  return fallback;
};

/**
 * Verifica se o avatar precisa ser carregado do Supabase Storage
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('supabase.co') || url.includes('/storage/v1/object/public/');
};

/**
 * Obtém URL pública do avatar do Supabase Storage
 */
export const getSupabaseAvatarUrl = (path: string): string => {
  if (!path) return '';
  
  // Se já é uma URL completa, retornar
  if (path.startsWith('http')) {
    return path;
  }
  
  // Se é um caminho do storage, adicionar base URL
  // Isso será tratado pelo Supabase client normalmente
  return path;
};

