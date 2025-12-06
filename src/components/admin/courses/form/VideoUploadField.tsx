import React, { useState, useCallback, useRef, useEffect } from "react";
import { Loader, X, Video } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { muxService } from "@/services/mux/muxService";
import { useMuxVideoUrl } from "@/hooks/useMuxVideoUrl";
import MuxPlayer from "@mux/mux-player-react";

interface VideoUploadFieldProps {
  value: string | undefined | null;
  onChange: (url: string) => void;
  companyId: string; // Obrigatório: ID da empresa para criar o vídeo
  onVideoId?: (videoId: string) => void; // Callback para retornar video_id após upload
}

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  value,
  onChange,
  companyId,
  onVideoId,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animar progresso de forma suave
  useEffect(() => {
    if (!isUploading) {
      setDisplayProgress(0);
      return;
    }

    let animationFrameId: number;
    
    const animate = () => {
      setDisplayProgress((prev) => {
        if (prev < uploadProgress) {
          // Incrementar gradualmente até o valor real
          const diff = uploadProgress - prev;
          const step = Math.max(0.3, diff * 0.15); // 15% da diferença por frame para animação mais rápida
          const next = Math.min(prev + step, uploadProgress);
          return next;
        }
        return prev;
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [uploadProgress, isUploading]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        toast.error("Por favor, selecione um arquivo de vídeo válido");
        return;
      }

      // Limite de 500MB para vídeos
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("O vídeo deve ter no máximo 500MB");
        return;
      }

      // Validar companyId antes de fazer upload
      if (!companyId) {
        toast.error("Selecione uma empresa antes de fazer upload do vídeo");
        return;
      }

      // Limpar toast anterior e iniciar upload
      toast.dismiss('mux-upload');
      toast.loading('Preparando upload...', { id: 'mux-upload' });
      
      setIsUploading(true);
      setUploadProgress(0);
      setDisplayProgress(0);

      try {
        // 1. Criar vídeo na tabela videos e Direct Upload URL no Mux
        console.log('[VideoUploadField] Chamando createUploadUrl com companyId:', companyId);
        const { upload_id, url: uploadUrl, video_id } = await muxService.createUploadUrl(companyId);

        // Guardar video_id localmente
        setCurrentVideoId(video_id);

        // 2. Retornar video_id via callback se fornecido
        if (onVideoId) {
          onVideoId(video_id);
        }

        // 3. Fazer upload do arquivo para o Mux
        toast.loading("Enviando vídeo...", { id: 'mux-upload' });
        
        await muxService.uploadVideo(
          file,
          uploadUrl,
          (progress) => {
            const percentage = Math.max(0, Math.min(100, progress.percentage));
            // Garantir que sempre mostre pelo menos 1% para feedback visual
            const minProgress = percentage > 0 ? Math.max(1, percentage) : 0;
            setUploadProgress(minProgress);
            toast.loading(`Enviando vídeo... ${Math.round(minProgress)}%`, { id: 'mux-upload' });
          }
        );

        console.log('[VideoUploadField] Upload concluído com sucesso');

        // 4. Upload terminou - agora é o Mux que processa
        setUploadProgress(100);
        // Aguardar um pouco para mostrar 100% antes de resetar
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setDisplayProgress(0);
        }, 500);

        // 5. Definir placeholder URL (será atualizado pelo webhook quando o vídeo estiver pronto)
        const placeholderUrl = `mux-video-${video_id}`;
        onChange(placeholderUrl);

        toast.success(
          'Upload concluído! Estamos processando o vídeo, isso pode levar alguns minutos.',
          { id: 'mux-upload' }
        );
      } catch (error: any) {
        console.error('[VideoUploadField] Erro no upload:', error);
        setIsUploading(false);
        setUploadProgress(0);
        setDisplayProgress(0);
        toast.error(`Erro ao enviar vídeo: ${error.message}`, { id: 'mux-upload' });
      } finally {
        setIsDragging(false);
      }
    },
    [onChange, companyId, onVideoId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      e.target.value = '';
    },
    [processFile]
  );

  const handleClick = () => {
    if (isUploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    toast.success("Vídeo removido");
  }, [onChange]);

  const getDisplayMessage = () => {
    if (isUploading) {
      return `Enviando vídeo... ${Math.round(displayProgress)}%`;
    }
    return "Arraste e solte o vídeo aqui ou clique para selecionar";
  };

  const getSubMessage = () => {
    if (isUploading) {
      return null;
    }
    return "MP4, MOV, AVI ou outros formatos de vídeo (max. 500MB)";
  };

  // Resolver mux-video-<id> em URL de playback
  const {
    url: muxPlaybackUrl,
    playbackId,
    muxStatus,
    thumbnailUrl,
  } = useMuxVideoUrl(value || null);

  const isMuxVideo = value?.startsWith("mux-video-");

  // Se for URL externa, usa direto
  const externalUrl = !isMuxVideo && value ? value : muxPlaybackUrl;

  // Verificar se é URL legada do Supabase Storage
  const isLegacyUrl = value && (value.includes('supabase') || value.includes('storage'));

  // Verificar se é placeholder mux-video-<id> ainda processando
  const isMuxVideoPending = isMuxVideo && (isUploading || muxStatus !== 'ready');

  // Se já tem vídeo (Mux ou legado), mostrar preview
  if (value && (isMuxVideo || isLegacyUrl)) {
    return (
      <div className="space-y-4">
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {isUploading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center space-y-2 w-full px-4">
                  <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500">Enviando vídeo... {Math.round(displayProgress)}%</p>
                  <div className="w-full max-w-xs mx-auto mt-2">
                    <Progress value={displayProgress} className="h-2" />
                  </div>
                </div>
              </div>
            ) : isMuxVideoPending ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center space-y-2">
                  <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500">
                    {isUploading && "Enviando vídeo..."}
                    {!isUploading && muxStatus !== "ready" && "Processando vídeo... Aguardando processamento..."}
                  </p>
                </div>
              </div>
            ) : isMuxVideo && muxStatus === "ready" && playbackId ? (
              // PLAYER DO MUX PARA VÍDEOS MUX
              <MuxPlayer
                playbackId={playbackId}
                streamType="on-demand"
                className="w-full h-full rounded-lg"
                autoPlay={false}
                controls
              />
            ) : externalUrl && !isMuxVideo ? (
              // VÍDEOS EXTERNOS (YouTube direto, Loom, etc) continuam no <video>
              <video
                src={externalUrl}
                controls
                className="w-full h-full rounded-lg object-contain"
                onError={(e) => {
                  console.error('Error loading video:', e);
                }}
              />
            ) : isLegacyUrl ? (
              <video
                src={value}
                controls
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Error loading video:', e);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center space-y-2">
                  <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500">Processando vídeo...</p>
                </div>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                  <span className="text-white text-sm font-medium">Enviando...</span>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div
          className={cn(
            "bg-white border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative group",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition duration-500 hover:duration-200"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Video className="w-4 h-4" />
            <span className="font-normal">
              {isUploading ? "Enviando..." : "Clique ou arraste para substituir"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem vídeo, mostrar área de upload
  return (
    <div
      className={cn(
        "bg-white border-2 border-dashed rounded-xl p-14 text-center transition-all cursor-pointer relative group",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : isUploading
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition duration-500 hover:duration-200",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={isUploading}
      />
      
      <div className="flex justify-center isolate mb-6">
        <div className={cn(
          "bg-white size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-gray-200 transition duration-500 group-hover:-translate-y-0.5 group-hover:duration-200",
          isDragging && "group-hover:-translate-y-1"
        )}>
          {isUploading ? (
            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
          ) : (
            <Video className={cn(
              "w-6 h-6 transition-colors",
              isDragging || isUploading
                ? "text-primary"
                : "text-gray-400"
            )} />
          )}
        </div>
      </div>
      
      <h2 className={cn(
        "text-gray-900 font-medium text-sm",
        (isDragging || isUploading) && "text-primary"
      )}>
        {getDisplayMessage()}
      </h2>
      {isUploading && (
        <div className="mt-4 w-full max-w-xs mx-auto">
          <Progress value={displayProgress} className="h-2" />
        </div>
      )}
      {getSubMessage() && (
        <p className="text-xs text-gray-500 mt-1">
          {getSubMessage()}
        </p>
      )}
    </div>
  );
};
