import { useFocus } from "@/contexts/FocusContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, Volume2, VolumeX, X, Maximize2, Minimize2, Plus, Minus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

export function FocusPopup() {
  const {
    isVisible,
    isPlaying,
    remainingSeconds,
    isRunning,
    isPaused,
    volume,
    isMuted,
    selectedMusic,
    musicEnabled,
    closeFocus,
    togglePlay,
    pause,
    resume,
    reset,
    addFiveMinutes,
    subtractFiveMinutes,
    setVolume,
    setMuted,
    setSelectedMusic,
    setMusicEnabled,
    musicOptions,
  } = useFocus();

  const { selectedCompany } = useCompanies();
  const { getInitialSelectedCompany } = useCompanyCache();
  const { isConnected: isSpotifyConnected, isLoading: isSpotifyLoading, user: spotifyUser, connect: connectSpotify, disconnect: disconnectSpotify } = useSpotifyAuth();

  const [accentColor, setAccentColor] = useState<string>(() => {
    try {
      const cachedCompany = getInitialSelectedCompany();
      return cachedCompany?.cor_principal || "#1EAEDB";
    } catch (e) {
      return "#1EAEDB";
    }
  });

  const [isExpanded, setIsExpanded] = useState(!isRunning);
  
  // Estado para posição do popup
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('focus_popup_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { x: parsed.x || 0, y: parsed.y || 0 };
      }
    } catch (e) {
      // Ignorar erros
    }
    return { x: 0, y: 0 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      setAccentColor(selectedCompany.cor_principal);
    }
  }, [selectedCompany]);

  // Auto-expand quando não está rodando
  useEffect(() => {
    if (!isRunning) {
      setIsExpanded(true);
    }
  }, [isRunning]);

  // Salvar posição no localStorage
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      try {
        localStorage.setItem('focus_popup_position', JSON.stringify(position));
      } catch (e) {
        // Ignorar erros
      }
    }
  }, [position]);

  // Handlers de drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Apenas botão esquerdo
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;

      // Limitar dentro da viewport
      const maxX = window.innerWidth - (popupRef.current?.offsetWidth || 320);
      const maxY = window.innerHeight - (popupRef.current?.offsetHeight || 400);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const showFloatingContainer = isRunning && !isExpanded;

  // Se está rodando e não está com popover aberto, mostrar versão compacta
  if (showFloatingContainer) {
    const compactPosition = position.x !== 0 || position.y !== 0 
      ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto' }
      : {};

    return (
      <div
        ref={popupRef}
        className={cn(
          "fixed z-50 bg-background/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm p-2 md:p-2.5 flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in-0",
          !position.x && !position.y && "top-20 right-4 md:top-20 md:right-6"
        )}
        style={{
          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 0.5px ${accentColor}20`,
          cursor: isDragging ? 'grabbing' : 'grab',
          ...compactPosition,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="flex flex-col items-center min-w-[50px]">
            <div
              className="text-lg md:text-xl font-semibold tabular-nums"
              style={{ color: accentColor }}
            >
              {formatTime(remainingSeconds)}
            </div>
          </div>
          
          <div className="h-6 md:h-7 w-px bg-border/50" />

          <div className="flex items-center gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
            {isPaused ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
                onClick={resume}
                onMouseDown={(e) => e.stopPropagation()}
                title="Continuar"
              >
                <Play className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
                onClick={pause}
                onMouseDown={(e) => e.stopPropagation()}
                title="Pausar"
              >
                <Pause className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
              onClick={closeFocus}
              onMouseDown={(e) => e.stopPropagation()}
              title="Parar"
            >
              <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
              onClick={() => setIsExpanded(true)}
              onMouseDown={(e) => e.stopPropagation()}
              title="Abrir configurações"
            >
              <Maximize2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Versão completa do popup
  const fullPosition = position.x !== 0 || position.y !== 0 
    ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
    : {};

  return (
    <div
      ref={popupRef}
      className={cn(
        "fixed z-50 rounded-3xl bg-background shadow-xl border border-border w-[320px] animate-in slide-in-from-bottom-2 fade-in-0",
        !position.x && !position.y && "bottom-6 right-6"
      )}
      style={{
        boxShadow: `0 10px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px ${accentColor}10`,
        ...fullPosition,
      }}
    >
      <div className="flex flex-col gap-0">
        {/* Header - área de arrasto */}
        <div 
          className="px-5 pt-5 pb-3.5 flex items-center justify-between border-b border-border/50 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-base leading-none font-semibold tracking-[-0.006em]">
            Foco e Produtividade
          </h3>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-muted/50"
                    onClick={() => setIsExpanded(false)}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Minimizar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-muted/50"
              onClick={closeFocus}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timer Section */}
        <div className="px-5 py-5 flex flex-col items-center justify-center space-y-4">
          {/* Timer com botões - e + */}
          <div className="flex items-center gap-3 justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={subtractFiveMinutes}
              disabled={isRunning || remainingSeconds <= 5 * 60}
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div
              className="text-5xl font-bold tabular-nums tracking-tight"
              style={{ color: accentColor }}
            >
              {formatTime(remainingSeconds)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={addFiveMinutes}
              disabled={isRunning || remainingSeconds >= 120 * 60}
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <TooltipProvider>
            <div className="flex items-center gap-2 w-full justify-center flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={togglePlay}
                    size="icon"
                    className="rounded-full h-8 w-8 shadow-sm hover:shadow-md transition-all"
                    style={{ 
                      backgroundColor: accentColor, 
                      color: "white",
                    }}
                  >
                    {isRunning && !isPaused ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRunning && !isPaused ? "Pausar" : "Iniciar"}
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={reset}
                    size="icon"
                    variant="outline"
                    className="rounded-full h-8 w-8 border hover:bg-muted/50 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Resetar
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Music Section */}
        <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-5">
          {/* Toca Disco Animado */}
          <div className="relative bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-5 flex items-center justify-center border border-border/50">
            <div className="relative w-36 h-24 flex items-center justify-center">
              {/* Vinil */}
              <div 
                className={cn(
                  "absolute w-24 h-24 rounded-full bg-black shadow-lg transition-all duration-500",
                  isPlaying && "animate-spin"
                )}
                style={{
                  animationDuration: '4s',
                  animationTimingFunction: 'linear',
                }}
              >
                {/* Linhas concêntricas do vinil */}
                <div className="absolute inset-0 rounded-full" style={{ margin: '6px' }}>
                  <div className="absolute inset-0 rounded-full border border-gray-800/40" />
                  <div className="absolute inset-0 rounded-full border border-gray-800/30" style={{ margin: '4px' }} />
                  <div className="absolute inset-0 rounded-full border border-gray-800/30" style={{ margin: '8px' }} />
                  <div className="absolute inset-0 rounded-full border border-gray-800/30" style={{ margin: '12px' }} />
                </div>
                
                {/* Centro do vinil com label */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-700 flex items-center justify-center shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                </div>
              </div>
              
              {/* Braço do toca disco */}
              <div 
                className="absolute top-2 right-6 w-14 h-1 bg-gradient-to-r from-white to-gray-100 rounded-full origin-top-right shadow-sm transition-transform duration-700 ease-out"
                style={{
                  transform: isPlaying ? 'rotate(-5deg)' : 'rotate(15deg)',
                  transformOrigin: 'top right',
                }}
              >
                <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-md" />
              </div>
              
              {/* Speaker grille */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center opacity-50">
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                // Toggle música - o provider cuida de tocar/pausar
                setMusicEnabled(!musicEnabled || !isPlaying);
              }}
              className="h-9 w-9 rounded-full border-2 flex-shrink-0"
              title={isPlaying ? "Pausar música" : "Tocar música"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                <SelectTrigger className="flex-1 rounded-xl border-gray-300 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {musicOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={isMuted ? [0] : [volume]}
              onValueChange={(value) => {
                setVolume(value[0]);
                setMuted(value[0] === 0);
              }}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          {/* Spotify Connection */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">Spotify</div>
              <div className="text-xs text-muted-foreground truncate">
                {isSpotifyLoading
                  ? "Carregando..."
                  : isSpotifyConnected
                  ? spotifyUser
                    ? `Conectado como ${spotifyUser.display_name || spotifyUser.id}`
                    : "Conectado"
                  : "Não conectado"}
              </div>
            </div>
            {isSpotifyConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectSpotify}
                className="ml-2 h-7 text-xs rounded-full px-3"
                disabled={isSpotifyLoading}
              >
                Desconectar
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={connectSpotify}
                className="ml-2 h-7 text-xs rounded-full px-3"
                style={{ backgroundColor: accentColor, color: "white" }}
                disabled={isSpotifyLoading}
              >
                Conectar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
