import { useEffect, useState, useRef, useCallback } from "react";
import { Timer, Play, Pause, Volume2, VolumeX, Music, X, Maximize2, Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { cn } from "@/lib/utils";

// Instância global de áudio compartilhada entre todas as montagens do componente
let globalAudioInstance: HTMLAudioElement | null = null;
let globalAudioListeners: Set<(playing: boolean) => void> = new Set();

const getGlobalAudio = (): HTMLAudioElement => {
  if (!globalAudioInstance) {
    globalAudioInstance = new Audio();
    globalAudioInstance.loop = true;
    globalAudioInstance.preload = 'auto';
  }
  return globalAudioInstance;
};

const notifyAudioListeners = (playing: boolean) => {
  globalAudioListeners.forEach(listener => listener(playing));
};

interface SpotifyConnection {
  isPlaying: boolean;
  currentTrack?: {
    name: string;
    artist: string;
    album: string;
  };
}

interface MusicOption {
  id: string;
  name: string;
  url: string;
}

// URLs de música ambiente
// Nota: Estas são URLs de exemplo. Para produção, substitua por suas próprias URLs hospedadas
// Sugestões: Mixkit, Freesound.org, ou hospede seus próprios arquivos MP3 no Supabase Storage
const MUSIC_OPTIONS: MusicOption[] = [
  {
    id: "acoustic-ambient",
    name: "Acoustic ambient",
    // URL de exemplo - substitua por URL real
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "nature-sounds",
    name: "Nature sounds",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "lo-fi-beats",
    name: "Lo-fi beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "rain-sounds",
    name: "Rain sounds",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "forest-ambient",
    name: "Forest ambient",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
];

export const FocusTimer = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState<string>("acoustic-ambient");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [spotify, setSpotify] = useState<SpotifyConnection>({
    isPlaying: false,
  });

  // Hook de autenticação Spotify
  const { isConnected: isSpotifyConnected, isLoading: isSpotifyLoading, user: spotifyUser, connect: connectSpotify, disconnect: disconnectSpotify } = useSpotifyAuth();

  const { selectedCompany } = useCompanies();
  const { getInitialSelectedCompany } = useCompanyCache();
  
  const [accentColor, setAccentColor] = useState<string>(() => {
    try {
      const cachedCompany = getInitialSelectedCompany();
      return cachedCompany?.cor_principal || "#1EAEDB";
    } catch (e) {
      return "#1EAEDB";
    }
  });

  // Usar o hook que persiste o estado do timer
  const {
    timeRemaining,
    isRunning,
    isPaused,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
    handleAddFiveMinutes,
    handleSubtractFiveMinutes,
  } = useFocusTimer();

  // Verificar se o timer estava rodando quando o componente foi montado
  useEffect(() => {
    if (isRunning && !isPaused && !wasRunningOnMountRef.current) {
      // Timer estava rodando quando componente foi montado (navegação)
      // Considerar que o usuário já tinha iniciado antes
      wasRunningOnMountRef.current = true;
      hasUserStartedTimerRef.current = true;
    }
  }, [isRunning, isPaused]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasUserStartedTimerRef = useRef(false);
  const wasRunningOnMountRef = useRef(false);
  
  // Usar instância global de áudio
  useEffect(() => {
    audioRef.current = getGlobalAudio();
    
    // Listener para atualizar estado quando áudio tocar/pausar
    const handleAudioStateChange = (playing: boolean) => {
      setIsMusicPlaying(playing);
    };
    
    globalAudioListeners.add(handleAudioStateChange);
    
    // Atualizar estado inicial baseado no estado atual do áudio global
    if (audioRef.current) {
      setIsMusicPlaying(!audioRef.current.paused);
    }
    
    return () => {
      globalAudioListeners.delete(handleAudioStateChange);
      // NÃO destruir o áudio global aqui - ele deve persistir entre montagens
    };
  }, []);

  // Helper functions para lidar com métodos de áudio que podem retornar undefined
  const safeLoad = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    try {
      const result = audio.load();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {});
      }
    } catch (error) {
      console.warn('Erro ao carregar áudio:', error);
    }
  }, []);

  const safePlay = useCallback((audio: HTMLAudioElement | null, onError?: (error: any) => void) => {
    if (!audio) return;
    try {
      const result = audio.play();
      if (result && typeof result.catch === 'function') {
        result.catch((error: any) => {
          if (onError) {
            onError(error);
          } else {
            console.error('Erro ao tocar música:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Erro ao tocar áudio:', error);
      if (onError) {
        onError(error);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      setAccentColor(selectedCompany.cor_principal);
    }
  }, [selectedCompany]);

  // Formatar tempo em minutos:segundos
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Formatar tempo em minutos para exibição
  const formatMinutes = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Som suave e agradável
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Erro ao tocar som de notificação:", error);
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    hasUserStartedTimerRef.current = false;
    wasRunningOnMountRef.current = false;
    
    // Pausar música
    if (audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
    
    // Pausar Spotify quando integração estiver pronta
    if (spotify.isPlaying) {
      setSpotify((prev) => ({ ...prev, isPlaying: false }));
    }

    // Tocar som de notificação suave
    playNotificationSound();
  }, [playNotificationSound]);

  // Escutar evento de conclusão do timer
  useEffect(() => {
    const handleComplete = () => {
      handleTimerComplete();
    };

    window.addEventListener('focusTimerComplete', handleComplete);
    return () => {
      window.removeEventListener('focusTimerComplete', handleComplete);
    };
  }, [handleTimerComplete]);

  // Pausar música apenas quando o popover fechar completamente (não quando reduzir para flutuante)
  useEffect(() => {
    // Só pausar se o popover fechou E o timer não está rodando (ou seja, fechou completamente)
    if (!isPopoverOpen && !isRunning && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, [isPopoverOpen, isRunning]);

  // Configurar listeners do áudio global uma vez
  useEffect(() => {
    if (!audioRef.current) return;

    const handlePlay = () => {
      setIsMusicPlaying(true);
      notifyAudioListeners(true);
    };
    const handlePause = () => {
      setIsMusicPlaying(false);
      notifyAudioListeners(false);
    };
    const handleEnded = () => {
      setIsMusicPlaying(false);
      notifyAudioListeners(false);
    };
    const handleError = (e: Event) => {
      console.error('Erro ao carregar música:', e);
      setIsMusicPlaying(false);
      notifyAudioListeners(false);
    };
    
    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('pause', handlePause);
    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, []);

  // Atualizar fonte quando música mudar
  useEffect(() => {
    if (!audioRef.current) return;
    
    const musicOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    if (!musicOption) return;

    try {
      const currentUrl = audioRef.current.src || '';
      const newUrl = musicOption.url || '';
      
      // Se não tem URL, não fazer nada
      if (!newUrl) {
        console.warn('URL de música não configurada para:', musicOption.name);
        return;
      }
      
      if (currentUrl !== newUrl) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.pause();
        audioRef.current.src = newUrl;
        safeLoad(audioRef.current);
        if (wasPlaying) {
          setTimeout(() => {
            if (audioRef.current) {
              safePlay(audioRef.current, (error) => {
                console.error('Erro ao tocar música:', error);
                setIsMusicPlaying(false);
                notifyAudioListeners(false);
              });
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
    }
  }, [selectedMusic, safeLoad, safePlay]);

  // Controlar volume
  useEffect(() => {
    if (audioRef.current) {
      try {
        audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
      } catch (error) {
        // Ignorar erros
      }
    }
  }, [volume, isMuted]);

  // Controlar reprodução baseado no timer
  // Continuar música se o timer estava rodando quando componente foi montado
  useEffect(() => {
    if (!audioRef.current) return;

    const musicOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    if (!musicOption || !musicOption.url) {
      // Se não tem URL configurada, não tentar tocar
      return;
    }

    try {
      // Tocar se:
      // 1. Timer está rodando E não pausado E música habilitada
      // 2. E (usuário iniciou explicitamente OU timer estava rodando quando montou)
      const shouldPlay = isRunning && !isPaused && musicEnabled && 
                        (hasUserStartedTimerRef.current || wasRunningOnMountRef.current);
      
      const isCurrentlyPlaying = !audioRef.current.paused;
      
      // Só tentar tocar se deveria estar tocando E não está tocando
      if (shouldPlay && !isCurrentlyPlaying) {
        // Garantir que a URL está configurada antes de tocar
        if (audioRef.current.src !== musicOption.url && musicOption.url) {
          audioRef.current.src = musicOption.url;
          safeLoad(audioRef.current);
        }
        safePlay(audioRef.current, (error) => {
          console.error('Erro ao tocar música:', error);
          setIsMusicPlaying(false);
          notifyAudioListeners(false);
        });
      } else if (!shouldPlay && isCurrentlyPlaying) {
        // Pausar se não deveria estar tocando
        audioRef.current.pause();
        setIsMusicPlaying(false);
        notifyAudioListeners(false);
      }
    } catch (error) {
      console.error('Erro ao controlar reprodução:', error);
    }
  }, [isRunning, isPaused, musicEnabled, selectedMusic, safeLoad, safePlay]);

  // NÃO fazer cleanup do áudio global no unmount
  // O áudio global deve persistir entre montagens

  // Preparar áudio de notificação
  useEffect(() => {
    if (!notificationAudioRef.current) {
      // Criar um som suave de notificação
      // Usaremos um beep simples gerado via Web Audio API
      notificationAudioRef.current = new Audio();
    }
  }, []);

  // Wrappers para os handlers que também controlam a música
  const handleStartWithMusic = () => {
    hasUserStartedTimerRef.current = true;
    handleStart();
    if (musicEnabled && audioRef.current) {
      safePlay(audioRef.current, (error) => {
        console.error('Erro ao tocar música:', error);
        setIsMusicPlaying(false);
      });
    }
  };

  const handlePauseWithMusic = () => {
    handlePause();
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleResumeWithMusic = () => {
    // Se estava pausado e está retomando, considerar que o usuário quer música
    if (isPaused) {
      hasUserStartedTimerRef.current = true;
    }
    handleResume();
    if (audioRef.current && musicEnabled) {
      safePlay(audioRef.current, (error) => {
        console.error('Erro ao retomar música:', error);
        setIsMusicPlaying(false);
      });
    }
  };

  const handleStopWithMusic = () => {
    hasUserStartedTimerRef.current = false;
    wasRunningOnMountRef.current = false;
    handleStop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
    if (spotify.isPlaying) {
      setSpotify((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const handleResetWithMusic = () => {
    hasUserStartedTimerRef.current = false;
    wasRunningOnMountRef.current = false;
    handleReset();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
    if (spotify.isPlaying) {
      setSpotify((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const handleMusicPlayPause = () => {
    if (!audioRef.current) return;
    
    const musicOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    if (!musicOption || !musicOption.url) {
      console.warn('URL de música não configurada');
      return;
    }
    
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      safePlay(audioRef.current, (error) => {
        console.error('Erro ao tocar música:', error);
        setIsMusicPlaying(false);
      });
    }
  };

  const handleSpotifyConnect = () => {
    // Redireciona para página de autorização do Spotify
    connectSpotify();
  };

  const handleSpotifyDisconnect = () => {
    disconnectSpotify();
    setSpotify({
      isPlaying: false,
    });
  };

  const presetTimes = [
    { label: "15 min", value: 15 * 60 },
    { label: "25 min", value: 25 * 60 },
    { label: "45 min", value: 45 * 60 },
    { label: "60 min", value: 60 * 60 },
  ];

  const showFloatingContainer = isRunning && !isPopoverOpen;

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-gray-500 dark:text-gray-300 hover:text-current dark:hover:text-current transition-colors relative",
              isRunning && !isPaused && "animate-pulse"
            )}
            style={
              {
                "--hover-color": accentColor,
                ...(isRunning && !isPaused
                  ? { color: accentColor }
                  : {}),
              } as React.CSSProperties
            }
          >
            <Timer className="h-5 w-5" />
            {isRunning && !isPaused && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping" />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-96 p-6 rounded-3xl" 
          align="end"
          sideOffset={8}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Foco e Produtividade</h3>
            </div>

            {/* Timer Section */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div
                className="text-6xl font-bold tabular-nums tracking-tight"
                style={{ color: accentColor }}
              >
                {formatTime(timeRemaining)}
              </div>

              <div className="flex items-center gap-3 w-full justify-center">
                <Button
                  onClick={isRunning && !isPaused ? handlePauseWithMusic : isPaused ? handleResumeWithMusic : handleStartWithMusic}
                  size="icon"
                  className="rounded-full h-10 w-10 flex-shrink-0"
                  style={{ backgroundColor: accentColor, color: "white" }}
                >
                  {isRunning && !isPaused ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  onClick={handleResetWithMusic}
                  size="icon"
                  variant="outline"
                  className="rounded-full h-10 w-10 flex-shrink-0 border-gray-300"
                  title="Resetar"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Botões -5 e +5 */}
              <div className="flex items-center gap-2 w-full justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSubtractFiveMinutes}
                  disabled={isRunning || timeRemaining <= 5 * 60}
                  className="rounded-full border-gray-300 h-8 px-4"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  5 min
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddFiveMinutes}
                  disabled={isRunning || timeRemaining >= 120 * 60}
                  className="rounded-full border-gray-300 h-8 px-4"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  5 min
                </Button>
              </div>
            </div>

            {/* Music Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Music className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                    <SelectTrigger className="flex-1 rounded-xl border-gray-300 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      {MUSIC_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={isMuted ? [0] : volume}
                  onValueChange={(value) => {
                    setVolume(value);
                    setIsMuted(value[0] === 0);
                  }}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>

              {/* Spotify Connection */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">Spotify</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {isSpotifyLoading
                      ? "Carregando..."
                      : isSpotifyConnected
                      ? spotify.currentTrack
                        ? `${spotify.currentTrack.name} - ${spotify.currentTrack.artist}`
                        : spotifyUser
                        ? `Conectado como ${spotifyUser.display_name || spotifyUser.id}`
                        : "Conectado"
                      : "Não conectado"}
                  </div>
                </div>
                {isSpotifyConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSpotifyDisconnect}
                    className="ml-2 h-8 text-xs rounded-full"
                    disabled={isSpotifyLoading}
                  >
                    Desconectar
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSpotifyConnect}
                    className="ml-2 h-8 text-xs rounded-full"
                    style={{ backgroundColor: accentColor, color: "white" }}
                    disabled={isSpotifyLoading}
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Container Flutuante Reduzido */}
      {showFloatingContainer && (
        <div
          className="fixed top-20 right-4 md:top-20 md:right-6 z-30 bg-background/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm p-2 md:p-2.5 flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in-0"
          style={{
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 0.5px ${accentColor}20`,
          }}
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="flex flex-col items-center min-w-[50px]">
              <div
                className="text-lg md:text-xl font-semibold tabular-nums"
                style={{ color: accentColor }}
              >
                {formatTime(timeRemaining)}
              </div>
            </div>
            
            <div className="h-6 md:h-7 w-px bg-border/50" />

            <div className="flex items-center gap-0.5">
              {isPaused ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
                  onClick={handleResumeWithMusic}
                  title="Continuar"
                >
                  <Play className="h-3 w-3 md:h-3.5 md:w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
                  onClick={handlePauseWithMusic}
                  title="Pausar"
                >
                  <Pause className="h-3 w-3 md:h-3.5 md:w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
                onClick={handleStopWithMusic}
                title="Parar"
              >
                <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7 hover:bg-muted/50"
                onClick={() => setIsPopoverOpen(true)}
                title="Abrir configurações"
              >
                <Maximize2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
