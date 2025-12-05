import { useState, useEffect, useRef, useCallback } from "react";

interface FocusTimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedTime: number;
  lastSavedTime: number | null; // Timestamp da última vez que salvamos o estado
  lastSavedTimeRemaining: number; // timeRemaining na última vez que salvamos
}

const STORAGE_KEY = "focus_timer_state";
const DEFAULT_TIME = 25 * 60; // 25 minutos em segundos

const getStoredState = (): FocusTimerState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    const now = Date.now();
    
    // Se o timer estava rodando, calcular o tempo restante baseado no último estado salvo
    if (state.isRunning && !state.isPaused) {
      // Se temos informação do último salvamento, usar ela para cálculo preciso
      if (state.lastSavedTime && state.lastSavedTimeRemaining !== undefined) {
        const timeSinceLastSave = Math.floor((now - state.lastSavedTime) / 1000);
        const newTimeRemaining = Math.max(0, state.lastSavedTimeRemaining - timeSinceLastSave);
        
        // Se o tempo acabou, parar o timer
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
      
      // Fallback: usar a lógica antiga se não temos lastSavedTime
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
    
    // Se não está rodando ou está pausado, retornar estado como está
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

export const useFocusTimer = () => {
  const initialState = getStoredState() || {
    timeRemaining: DEFAULT_TIME,
    isRunning: false,
    isPaused: false,
    startedAt: null,
    pausedAt: null,
    totalPausedTime: 0,
    lastSavedTime: null,
    lastSavedTimeRemaining: DEFAULT_TIME,
  };

  const [timeRemaining, setTimeRemaining] = useState(initialState.timeRemaining);
  const [isRunning, setIsRunning] = useState(initialState.isRunning);
  const [isPaused, setIsPaused] = useState(initialState.isPaused);
  
  const startedAtRef = useRef<number | null>(initialState.startedAt);
  const pausedAtRef = useRef<number | null>(initialState.pausedAt);
  const totalPausedTimeRef = useRef<number>(initialState.totalPausedTime || 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Salvar estado no localStorage sempre que mudar
  // Usar um ref para evitar salvar muito frequentemente
  const lastSaveRef = useRef<number>(0);
  
  useEffect(() => {
    const now = Date.now();
    // Salvar no máximo a cada 500ms para evitar muitas escritas no localStorage
    if (now - lastSaveRef.current < 500 && isRunning && !isPaused) {
      return;
    }
    
    lastSaveRef.current = now;
    saveState({
      timeRemaining,
      isRunning,
      isPaused,
      startedAt: startedAtRef.current,
      pausedAt: pausedAtRef.current,
      totalPausedTime: totalPausedTimeRef.current,
      lastSavedTime: now,
      lastSavedTimeRemaining: timeRemaining,
    });
    
    // Cleanup: salvar estado final quando componente for desmontado
    return () => {
      const finalNow = Date.now();
      saveState({
        timeRemaining,
        isRunning,
        isPaused,
        startedAt: startedAtRef.current,
        pausedAt: pausedAtRef.current,
        totalPausedTime: totalPausedTimeRef.current,
        lastSavedTime: finalNow,
        lastSavedTimeRemaining: timeRemaining,
      });
    };
  }, [timeRemaining, isRunning, isPaused]);

  // Atualizar timer a cada segundo
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            startedAtRef.current = null;
            pausedAtRef.current = null;
            totalPausedTimeRef.current = 0;
            // Disparar evento customizado quando timer completar
            window.dispatchEvent(new CustomEvent('focusTimerComplete'));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining]);

  const handleStart = useCallback(() => {
    const now = Date.now();
    startedAtRef.current = now;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    // Salvar estado imediatamente ao iniciar
    saveState({
      timeRemaining,
      isRunning: true,
      isPaused: false,
      startedAt: now,
      pausedAt: null,
      totalPausedTime: 0,
      lastSavedTime: null,
      lastSavedTimeRemaining: timeRemaining,
    });
  }, [timeRemaining]);

  const handlePause = useCallback(() => {
    if (startedAtRef.current && !pausedAtRef.current) {
      pausedAtRef.current = Date.now();
    }
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    if (pausedAtRef.current && startedAtRef.current) {
      const pauseDuration = Date.now() - pausedAtRef.current;
      totalPausedTimeRef.current += pauseDuration;
      pausedAtRef.current = null;
    }
    setIsPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(DEFAULT_TIME);
    startedAtRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(DEFAULT_TIME);
    startedAtRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
  }, []);

  const handleAddMinute = useCallback(() => {
    setTimeRemaining((prev) => prev + 60);
  }, []);

  const handleAddFiveMinutes = useCallback(() => {
    setTimeRemaining((prev) => Math.min(prev + 5 * 60, 120 * 60));
  }, []);

  const handleSubtractFiveMinutes = useCallback(() => {
    setTimeRemaining((prev) => Math.max(prev - 5 * 60, 5 * 60));
  }, []);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
    handleAddMinute,
    handleAddFiveMinutes,
    handleSubtractFiveMinutes,
    setTimeRemaining,
  };
};
