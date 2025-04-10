
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, List, Video } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

// Definimos alguns vídeos de exemplo para a playlist
const SAMPLE_VIDEOS = [
  { 
    id: '1', 
    title: 'Boas-vindas à Empresa', 
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    duration: '3:45',
    description: 'Uma introdução à nossa empresa, valores e cultura.'
  },
  { 
    id: '2', 
    title: 'Conheça Nossa Equipe', 
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    url: 'https://www.youtube.com/embed/C0DPdy98e4c', 
    duration: '5:12',
    description: 'Apresentação dos membros da equipe e suas funções.'
  },
  { 
    id: '3', 
    title: 'Nossos Produtos e Serviços', 
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    url: 'https://www.youtube.com/embed/jNQXAC9IVRw', 
    duration: '4:30',
    description: 'Visão geral dos produtos e serviços oferecidos pela empresa.'
  },
  { 
    id: '4', 
    title: 'Procedimentos Internos', 
    thumbnail: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    url: 'https://www.youtube.com/embed/TcMBFSGVi1c', 
    duration: '6:18',
    description: 'Guia sobre os procedimentos internos e políticas da empresa.'
  },
];

interface VideoPlaylistProps {
  companyId?: string;
  mainVideo: string;
  mainVideoDescription: string;
}

export const VideoPlaylist: React.FC<VideoPlaylistProps> = ({ 
  companyId,
  mainVideo,
  mainVideoDescription
}) => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  // Inicializar com o vídeo principal ou com o primeiro vídeo da playlist
  const initialVideo = mainVideo || SAMPLE_VIDEOS[0].url;
  const initialDescription = mainVideoDescription || SAMPLE_VIDEOS[0].description;
  
  const [currentVideo, setCurrentVideo] = useState(initialVideo);
  const [currentDescription, setCurrentDescription] = useState(initialDescription);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  // Função para selecionar um vídeo da playlist
  const handleSelectVideo = (video: typeof SAMPLE_VIDEOS[0], index: number) => {
    setCurrentVideo(video.url);
    setCurrentDescription(video.description);
    setSelectedVideoIndex(index);
  };

  // Formatamos o URL do vídeo para garantir que ele funcione como um embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Se já for um URL de embed, retorna como está
    if (url.includes('embed')) return url;
    
    // YouTube: converte o URL padrão para o formato de embed
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // YouTube: converte o URL curto para o formato de embed
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo: converte o URL padrão para o formato de embed
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(currentVideo);

  // Estilo dinâmico com a cor da empresa
  const companyColorStyle = {
    borderColor: companyColor,
    '--company-color': companyColor
  } as React.CSSProperties;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800">
              {embedUrl ? (
                <iframe 
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Vídeo de integração"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Video className="h-16 w-16 text-gray-400" />
                  <p className="text-gray-500 mt-4">Nenhum vídeo selecionado</p>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="mt-2">
                <p className="text-gray-700 dark:text-gray-300">
                  {currentDescription || "Sem descrição disponível."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <List className="h-5 w-5 mr-2" style={{ color: companyColor }} />
                <h3 className="font-medium">Playlist de vídeos</h3>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {SAMPLE_VIDEOS.map((video, index) => (
                  <div 
                    key={video.id}
                    onClick={() => handleSelectVideo(video, index)}
                    className={`flex items-start space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedVideoIndex === index 
                        ? 'border-l-4' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={selectedVideoIndex === index ? 
                      { 
                        borderLeftColor: companyColor,
                        backgroundColor: `${companyColor}10` // 10% opacity
                      } : {}}
                  >
                    <div className="relative flex-shrink-0 w-20 h-12 rounded overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
