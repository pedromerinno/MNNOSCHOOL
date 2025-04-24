
/**
 * Extracts the YouTube video ID from a URL
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Extracts the Loom video ID from a URL
 */
export const getLoomVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle share URLs like https://www.loom.com/share/[video-id]
  const shareRegExp = /^.*loom\.com\/share\/([a-zA-Z0-9-]+)/;
  const shareMatch = url.match(shareRegExp);
  if (shareMatch && shareMatch[1]) {
    return shareMatch[1];
  }
  
  // Handle embed URLs
  const embedRegExp = /^.*loom\.com\/embed\/([a-zA-Z0-9-]+)/;
  const embedMatch = url.match(embedRegExp);
  return embedMatch ? embedMatch[1] : null;
};

/**
 * Converts a regular video URL to an embed URL
 */
export const getEmbedUrl = (url: string) => {
  if (!url) return '';
  
  // Se já for um URL de embed do Loom, retornar como está
  if (url.includes('loom.com/embed/')) {
    return url;
  }
  
  // Loom: converter URL normal para formato embed
  if (url.includes('loom.com/share/')) {
    const videoId = getLoomVideoId(url);
    return videoId ? `https://www.loom.com/embed/${videoId}` : '';
  }
  
  // Se já for um URL de embed do YouTube, transformar para nocookie
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('/').pop();
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  
  // YouTube: converter URL padrão para formato nocookie
  if (url.includes('youtube.com/watch')) {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
  }
  
  // YouTube: converter URL curta para formato nocookie
  if (url.includes('youtu.be')) {
    const videoId = url.split('/').pop();
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
  }
  
  // Se não for YouTube nem Loom, retornar a URL original
  return url;
};

