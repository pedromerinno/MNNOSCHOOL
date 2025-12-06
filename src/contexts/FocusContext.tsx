import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

interface MusicOption {
  id: string;
  name: string;
  url: string;
}

const MUSIC_OPTIONS: MusicOption[] = [
  {
    id: "acoustic-ambient",
    name: "Acoustic ambient",
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

interface FocusContextType {
  isVisible: boolean;
  isPlaying: boolean;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  volume: number;
  isMuted: boolean;
  selectedMusic: string;
  musicEnabled: boolean;
  openFocus: (seconds: number) => void;
  closeFocus: () => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addFiveMinutes: () => void;
  subtractFiveMinutes: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setSelectedMusic: (musicId: string) => void;
  setMusicEnabled: (enabled: boolean) => void;
  musicOptions: MusicOption[];
}

const FocusContext = createContext<FocusContextType | null>(null);

const STORAGE_KEY = "focus_timer_state";
const DEFAULT_TIME = 25 * 60; // 25 minutos

interface FocusTimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedTime: number;
  lastSavedTime: number | null;
  lastSavedTimeRemaining: number;
}

const getStoredState = (): FocusTimerState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    const now = Date.now();
    
    if (state.isRunning && !state.isPaused) {
      if (state.lastSavedTime && state.lastSavedTimeRemaining !== undefined) {
        const timeSinceLastSave = Math.floor((now - state.lastSavedTime) / 1000);
        const newTimeRemaining = Math.max(0, state.lastSavedTimeRemaining - timeSinceLastSave);
        
        if (newTimeRemaining <= 0) {
          return {
            timeRemaining: 0,
            isRunning: false,
            isPaused: false,
            startedAt: null,
            pausedAt: null,
            totalPausedTime: 0,
            lastSavedTime: null,
            lastSavedTimeRemaining: 0,
          };
        }
        
        return {
          ...state,
          timeRemaining: newTimeRemaining,
          lastSavedTime: now,
          lastSavedTimeRemaining: newTimeRemaining,
        };
      }
      
      if (state.startedAt) {
        const elapsed = Math.floor((now - state.startedAt - (state.totalPausedTime || 0)) / 1000);
        const newTimeRemaining = Math.max(0, state.timeRemaining - elapsed);
        
        if (newTimeRemaining <= 0) {
          return {
            timeRemaining: 0,
            isRunning: false,
            isPaused: false,
            startedAt: null,
            pausedAt: null,
            totalPausedTime: 0,
            lastSavedTime: null,
            lastSavedTimeRemaining: 0,
          };
        }
        
        return {
          ...state,
          timeRemaining: newTimeRemaining,
          lastSavedTime: now,
          lastSavedTimeRemaining: newTimeRemaining,
        };
      }
    }
    
    return {
      ...state,
      lastSavedTime: state.lastSavedTime || null,
      lastSavedTimeRemaining: state.lastSavedTimeRemaining !== undefined ? state.lastSavedTimeRemaining : state.timeRemaining,
    };
  } catch (error) {
    console.error("Erro ao recuperar estado do timer:", error);
    return null;
  }
};

const saveState = (state: FocusTimerState) => {
  try {
    const stateToSave = {
      ...state,
      lastSavedTime: Date.now(),
      lastSavedTimeRemaining: state.timeRemaining,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error("Erro ao salvar estado do timer:", error);
  }
};

const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem('focus_timer_cancelled', 'true');
    localStorage.setItem('focus_audio_cancelled', 'true');
  } catch (error) {
    console.error("Erro ao limpar estado do timer:", error);
  }
};

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wasCancelled = useRef(() => {
    try {
      return localStorage.getItem('focus_timer_cancelled') === 'true';
    } catch {
      return false;
    }
  });

  const initialState = wasCancelled.current() ? {
    timeRemaining: DEFAULT_TIME,
    isRunning: false,
    isPaused: false,
    startedAt: null,
    pausedAt: null,
    totalPausedTime: 0,
    lastSavedTime: null,
    lastSavedTimeRemaining: DEFAULT_TIME,
  } : (getStoredState() || {
    timeRemaining: DEFAULT_TIME,
    isRunning: false,
    isPaused: false,
    startedAt: null,
    pausedAt: null,
    totalPausedTime: 0,
    lastSavedTime: null,
    lastSavedTimeRemaining: DEFAULT_TIME,
  });

  const [isVisible, setIsVisible] = useState(initialState.isRunning || initialState.isPaused);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(initialState.timeRemaining);
  const [isRunning, setIsRunning] = useState(initialState.isRunning);
  const [isPaused, setIsPaused] = useState(initialState.isPaused);
  const [volume, setVolumeState] = useState(50);
  const [isMuted, setIsMutedState] = useState(false);
  const [selectedMusic, setSelectedMusicState] = useState("acoustic-ambient");
  const [musicEnabled, setMusicEnabledState] = useState(true);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef<number | null>(initialState.startedAt);
  const pausedAtRef = useRef<number | null>(initialState.pausedAt);
  const totalPausedTimeRef = useRef<number>(initialState.totalPausedTime || 0);
  const lastSaveRef = useRef<number>(0);
  const hasUserStartedRef = useRef(false);
  const userWantsMusicRef = useRef(false);

  // Inicializar áudio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.preload = 'auto';
    audioRef.current.volume = isMuted ? 0 : volume / 100;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setIsPlaying(false);

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
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Atualizar volume do áudio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Atualizar fonte de música
  useEffect(() => {
    if (!audioRef.current) return;
    
    const musicOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    if (!musicOption || !musicOption.url) return;

    const wasPlaying = isPlaying;
    if (wasPlaying) {
      audioRef.current.pause();
    }
    
    audioRef.current.src = musicOption.url;
    audioRef.current.load();
    
    if (wasPlaying && isRunning && !isPaused && musicEnabled) {
      setTimeout(() => {
        audioRef.current?.play().catch(() => {
          setIsPlaying(false);
        });
      }, 100);
    }
  }, [selectedMusic, isRunning, isPaused, musicEnabled, isPlaying]);

  // Controlar reprodução baseado no timer
  useEffect(() => {
    if (!audioRef.current) return;
    
    const wasCancelled = localStorage.getItem('focus_timer_cancelled') === 'true';
    const audioCancelled = localStorage.getItem('focus_audio_cancelled') === 'true';
    
    if (wasCancelled || audioCancelled) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      return;
    }

    const musicOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    if (!musicOption || !musicOption.url) return;

    const shouldPlay = isRunning && !isPaused && musicEnabled && (hasUserStartedRef.current || userWantsMusicRef.current);
    const isCurrentlyPlaying = !audioRef.current.paused;

    if (audioRef.current.src !== musicOption.url) {
      audioRef.current.src = musicOption.url;
      audioRef.current.load();
    }

    if (shouldPlay && !isCurrentlyPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else if (!shouldPlay && isCurrentlyPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isRunning, isPaused, musicEnabled, selectedMusic]);

  // Salvar estado no localStorage
  useEffect(() => {
    if (!isRunning) return;
    
    const now = Date.now();
    if (now - lastSaveRef.current < 500 && isRunning && !isPaused) {
      return;
    }
    
    lastSaveRef.current = now;
    saveState({
      timeRemaining: remainingSeconds,
      isRunning,
      isPaused,
      startedAt: startedAtRef.current,
      pausedAt: pausedAtRef.current,
      totalPausedTime: totalPausedTimeRef.current,
      lastSavedTime: now,
      lastSavedTimeRemaining: remainingSeconds,
    });
  }, [remainingSeconds, isRunning, isPaused]);

  // Timer interval
  useEffect(() => {
    if (isRunning && !isPaused && remainingSeconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            startedAtRef.current = null;
            pausedAtRef.current = null;
            totalPausedTimeRef.current = 0;
            clearState();
            window.dispatchEvent(new CustomEvent('focusTimerComplete'));
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              setIsPlaying(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, remainingSeconds]);

  // Escutar evento de conclusão
  useEffect(() => {
    const handleComplete = () => {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

    window.addEventListener('focusTimerComplete', handleComplete);
    return () => {
      window.removeEventListener('focusTimerComplete', handleComplete);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const openFocus = useCallback((seconds: number) => {
    try {
      localStorage.removeItem('focus_timer_cancelled');
      localStorage.removeItem('focus_audio_cancelled');
    } catch (e) {
      // Ignorar erros
    }
    
    setRemainingSeconds(seconds);
    setIsVisible(true);
    hasUserStartedRef.current = false;
  }, []);

  const closeFocus = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setIsPlaying(false);
    setIsVisible(false);
    setRemainingSeconds(DEFAULT_TIME);
    startedAtRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
    hasUserStartedRef.current = false;
    userWantsMusicRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    clearState();
  }, [clearTimer]);

  const togglePlay = useCallback(() => {
    if (isRunning && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
    }
  }, [isRunning, isPaused]);

  const start = useCallback(() => {
    try {
      localStorage.removeItem('focus_timer_cancelled');
      localStorage.removeItem('focus_audio_cancelled');
    } catch (e) {
      // Ignorar erros
    }
    
    const now = Date.now();
    startedAtRef.current = now;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setIsVisible(true);
    hasUserStartedRef.current = true;
    
    saveState({
      timeRemaining: remainingSeconds,
      isRunning: true,
      isPaused: false,
      startedAt: now,
      pausedAt: null,
      totalPausedTime: 0,
      lastSavedTime: null,
      lastSavedTimeRemaining: remainingSeconds,
    });
  }, [remainingSeconds]);

  const pause = useCallback(() => {
    if (startedAtRef.current && !pausedAtRef.current) {
      pausedAtRef.current = Date.now();
    }
    setIsPaused(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (pausedAtRef.current && startedAtRef.current) {
      const pauseDuration = Date.now() - pausedAtRef.current;
      totalPausedTimeRef.current += pauseDuration;
      pausedAtRef.current = null;
    }
    setIsPaused(false);
    hasUserStartedRef.current = true;
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setIsPlaying(false);
    setRemainingSeconds(DEFAULT_TIME);
    startedAtRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
    hasUserStartedRef.current = false;
    userWantsMusicRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    clearState();
  }, [clearTimer]);

  const addFiveMinutes = useCallback(() => {
    setRemainingSeconds((prev) => Math.min(prev + 5 * 60, 120 * 60));
  }, []);

  const subtractFiveMinutes = useCallback(() => {
    setRemainingSeconds((prev) => Math.max(prev - 5 * 60, 5 * 60));
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    setIsMutedState(vol === 0);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
  }, []);

  const setSelectedMusic = useCallback((musicId: string) => {
    setSelectedMusicState(musicId);
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    setMusicEnabledState(enabled);
    if (enabled) {
      userWantsMusicRef.current = true;
      // Se o timer está rodando, tocar música imediatamente
      if (isRunning && !isPaused && audioRef.current) {
        const musicOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
        if (musicOption && musicOption.url) {
          if (audioRef.current.src !== musicOption.url) {
            audioRef.current.src = musicOption.url;
            audioRef.current.load();
          }
          audioRef.current.play().catch(() => {
            setIsPlaying(false);
          });
        }
      }
    } else {
      userWantsMusicRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isRunning, isPaused, selectedMusic]);

  return (
    <FocusContext.Provider
      value={{
        isVisible,
        isPlaying,
        remainingSeconds,
        isRunning,
        isPaused,
        volume,
        isMuted,
        selectedMusic,
        musicEnabled,
        openFocus,
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
        musicOptions: MUSIC_OPTIONS,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus deve ser usado dentro de FocusProvider");
  return ctx;
};
