
import React from 'react';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export const HtmlContent: React.FC<HtmlContentProps> = ({ content, className = '' }) => {
  // Função simples para converter quebras de linha em <br> e preservar links
  const formatHtmlContent = (text: string): string => {
    if (!text) return '';
    
    // Converter quebras de linha para <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Converter URLs em links clicáveis (regex simples para URLs)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // Converter emails em links clicáveis
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    formatted = formatted.replace(emailRegex, '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    return formatted;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: formatHtmlContent(content) 
      }} 
    />
  );
};
