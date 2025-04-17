
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAutoplayNavigation = (
  nextLesson: { id: string; title: string; type: string } | null,
  courseId: string | undefined
) => {
  const [autoplay, setAutoplay] = useState(true);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [autoplayTimer, setAutoplayTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const toggleAutoplay = useCallback(() => {
    const newValue = !autoplay;
    setAutoplay(newValue);
    // Salva a preferência do usuário no localStorage
    localStorage.setItem('lessonAutoplay', newValue.toString());
  }, [autoplay]);

  useEffect(() => {
    // Carrega a preferência do usuário do localStorage
    const savedAutoplay = localStorage.getItem('lessonAutoplay');
    if (savedAutoplay !== null) {
      setAutoplay(savedAutoplay === 'true');
    }
  }, []);

  // Clear autoplay timer when unmounting or when lessons change
  useEffect(() => {
    return () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
    };
  }, [autoplayTimer, nextLesson]);

  const handleVideoEnd = useCallback(() => {
    console.log('Video ended, autoplay is:', autoplay, 'next lesson:', nextLesson?.title);
    
    if (nextLesson && autoplay) {
      setShowAutoplayPrompt(true);
      
      // Limpa qualquer timer existente antes de criar um novo
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
      
      // Aguarda 5 segundos antes de navegar para a próxima aula
      const timer = setTimeout(() => {
        console.log('Navigating to next lesson:', nextLesson.title);
        setShowAutoplayPrompt(false);
        if (courseId) {
          navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
        }
      }, 5000);
      
      setAutoplayTimer(timer);
    }
  }, [nextLesson, autoplay, navigate, courseId, autoplayTimer]);

  const cancelAutoplay = useCallback(() => {
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
      setAutoplayTimer(null);
    }
    setShowAutoplayPrompt(false);
  }, [autoplayTimer]);

  return {
    autoplay,
    showAutoplayPrompt,
    toggleAutoplay,
    handleVideoEnd,
    setShowAutoplayPrompt,
    cancelAutoplay
  };
};
