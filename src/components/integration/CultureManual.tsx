
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Target, Lightbulb, Users, Shield, Zap, Star, Award, AlertCircle, Video, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatedCard } from "@/components/ui/feature-block-animated-card";
import { getEmbedUrl } from './video-playlist/utils';
import VideoPlayerStyled from "@/components/ui/video-player";
import { EmptyState } from "@/components/ui/empty-state";
import { AddCompanyValueDialog } from "@/components/admin/dialogs/AddCompanyValueDialog";

interface CultureManualProps {
  companyValues: any;
  companyMission: string;
  companyHistory: string;
  companyColor: string;
  companyLogo?: string;
  companyName?: string;
  videoUrl?: string;
  videoDescription?: string;
}

export const CultureManual: React.FC<CultureManualProps> = ({
  companyValues,
  companyMission,
  companyHistory,
  companyColor,
  companyLogo,
  companyName,
  videoUrl,
  videoDescription
}) => {
  const { userProfile } = useAuth();
  const [isAddValueDialogOpen, setIsAddValueDialogOpen] = useState(false);
  
  // Verificar se o manual já foi aceito
  const isManualAccepted = userProfile?.manual_cultura_aceito || false;
  
  // Verificar se o usuário é admin
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  // Memoizar os valores para evitar re-processamento
  const values = useMemo(() => {
    if (!companyValues) return [];
    
    if (typeof companyValues === 'string') {
      try {
        const parsed = JSON.parse(companyValues);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [parsed];
      } catch (error) {
        console.error('Error parsing company values:', error);
        if (companyValues.trim()) {
          return [{
            title: 'Valor',
            description: companyValues
          }];
        }
        return [];
      }
    }

    if (Array.isArray(companyValues)) {
      return companyValues;
    }

    if (typeof companyValues === 'object' && companyValues !== null) {
      return [companyValues];
    }
    
    return [];
  }, [companyValues]);

  // Função para escolher ícones baseado no título do valor (retorna array para AnimatedCard)
  const getValueIcons = (title: string, index: number) => {
    const titleLower = title.toLowerCase();
    
    // Mapear títulos para ícones principais
    const getMainIcon = () => {
      if (titleLower.includes('inovação') || titleLower.includes('inovacao')) {
        return <Lightbulb className="w-full h-full" />;
      }
      if (titleLower.includes('excelência') || titleLower.includes('excelencia')) {
        return <Award className="w-full h-full" />;
      }
      if (titleLower.includes('qualidade')) {
        return <Star className="w-full h-full" />;
      }
      if (titleLower.includes('pessoas') || titleLower.includes('colaboração') || titleLower.includes('colaboracao')) {
        return <Users className="w-full h-full" />;
      }
      if (titleLower.includes('integridade') || titleLower.includes('ética') || titleLower.includes('etica')) {
        return <Shield className="w-full h-full" />;
      }
      if (titleLower.includes('agilidade')) {
        return <Zap className="w-full h-full" />;
      }
      if (titleLower.includes('foco')) {
        return <Target className="w-full h-full" />;
      }
      if (titleLower.includes('paixão') || titleLower.includes('paixao')) {
        return <Heart className="w-full h-full" />;
      }
      
      // Ícones padrão por índice
      const defaultIcons = [
        <Heart className="w-full h-full" />,
        <Target className="w-full h-full" />,
        <Lightbulb className="w-full h-full" />,
        <Users className="w-full h-full" />,
        <Shield className="w-full h-full" />,
        <Zap className="w-full h-full" />,
        <Star className="w-full h-full" />,
        <Award className="w-full h-full" />,
      ];
      
      return defaultIcons[index % defaultIcons.length];
    };

    // Retornar array com o ícone principal em diferentes tamanhos para animação
    return [
      {
        icon: getMainIcon(),
        size: "sm" as const,
      },
      {
        icon: getMainIcon(),
        size: "md" as const,
      },
    ];
  };


  // Estados para o vídeo simplificado
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Resetar estados do vídeo ao trocar de vídeo
  useEffect(() => {
    if (videoUrl) {
      setVideoError(false);
      setVideoLoading(true);
      
      const timeout = setTimeout(() => {
        setVideoLoading(false);
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [videoUrl]);

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
    setVideoError(false);
  };

  // Detectar tipo de vídeo
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const isLoom = videoUrl && videoUrl.includes('loom.com');
  const isDirectVideo = videoUrl && !isYouTube && !isLoom && (
    /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)(\?|#|$)/i.test(videoUrl) ||
    videoUrl.match(/^https?:\/\/.*\/.*\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)/i)
  );
  const shouldUseDirectVideo = isDirectVideo && !isYouTube && !isLoom;
  const embedUrl = getEmbedUrl(videoUrl || '');

  return (
    <div className="space-y-8">
      {/* Seção 1: Vídeo Institucional */}
      {videoUrl && (
        <div className="w-full -mx-4 lg:-mx-6 px-4 lg:px-6">
          <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 relative w-full min-h-[500px]">
          {shouldUseDirectVideo ? (
            <>
              <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
                <VideoPlayerStyled 
                  src={videoUrl} 
                  fullWidth 
                  onLoad={handleVideoLoad}
                  onError={handleVideoError}
                />
              </div>
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 rounded-xl">
                  <div className="animate-spin h-8 w-8 border-t-2 border-primary border-r-2 rounded-full"></div>
                </div>
              )}
            </>
          ) : (
            <>
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="animate-spin h-8 w-8 border-t-2 border-primary border-r-2 rounded-full"></div>
                </div>
              )}
              
              {videoError && isYouTube ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center rounded-xl">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">A conexão com YouTube foi recusada</h3>
                  <p className="text-muted-foreground mb-4">
                    Isso pode ocorrer devido a bloqueios de rede ou restrições de privacidade.
                  </p>
                  <Button asChild variant="outline">
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Assistir diretamente no YouTube
                    </a>
                  </Button>
                </div>
              ) : videoError && isLoom ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center rounded-xl">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">A conexão com Loom foi recusada</h3>
                  <p className="text-muted-foreground mb-4">
                    Isso pode ocorrer devido a bloqueios de rede, cookies de terceiros ou restrições de privacidade.
                  </p>
                  <Button asChild variant="outline">
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Assistir diretamente no Loom
                    </a>
                  </Button>
                </div>
              ) : videoError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center rounded-xl">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Erro ao carregar o vídeo</h3>
                  <p className="text-muted-foreground mb-4">
                    Não foi possível carregar o conteúdo do vídeo.
                  </p>
                </div>
              ) : null}
              
              {!shouldUseDirectVideo && (embedUrl || videoUrl) && (
                <iframe 
                  key={embedUrl || videoUrl}
                  src={embedUrl || videoUrl} 
                  className="w-full h-full border-0 rounded-xl" 
                  style={{
                    display: videoError ? 'none' : 'block'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                  allowFullScreen 
                  title="Vídeo de integração" 
                  onError={handleVideoError} 
                  onLoad={handleVideoLoad}
                  loading="lazy"
                />
              )}
            </>
          )}
          </div>
        </div>
      )}

      {/* Seção 2: Missão e Valores */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Missão e Valores
        </h2>
        
        {/* Missão */}
        {companyMission && (
          <div className="space-y-3 mb-8">
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Missão</h3>
            <p className="text-lg lg:text-xl text-gray-900 dark:text-white font-medium leading-relaxed max-w-3xl">
              {companyMission}
            </p>
          </div>
        )}

        {/* Valores */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
            Nossos Valores
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {values.length > 0 ? values.map((value: {
              title: string;
              description: string;
            }, index: number) => (
              <AnimatedCard
                key={index}
                title={value.title || 'Valor'}
                description={value.description || 'Descrição do valor'}
                icons={getValueIcons(value.title || 'Valor', index)}
                className="w-full"
                companyColor={companyColor}
              />
            )) : (
              <div className="col-span-full">
                <EmptyState
                  title="Nenhum valor cadastrado"
                  description="Não há valores cadastrados para esta empresa."
                  icons={[Heart]}
                  action={isAdmin ? {
                    label: "Adicionar novo valor",
                    onClick: () => setIsAddValueDialogOpen(true)
                  } : undefined}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <AddCompanyValueDialog
        open={isAddValueDialogOpen}
        onOpenChange={setIsAddValueDialogOpen}
        onValueAdded={() => {
          // Disparar evento para atualizar valores no componente pai
          window.dispatchEvent(new CustomEvent('company-values-updated'));
        }}
      />
    </div>
  );
};
