
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
 * Converts a regular YouTube URL to an embed URL with privacy enhancements
 */
export const getEmbedUrl = (url: string) => {
  if (!url) return '';
  
  // Se já for um URL de embed, transformar para nocookie
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
  
  // Se não for YouTube, retornar a URL original
  return url;
};
