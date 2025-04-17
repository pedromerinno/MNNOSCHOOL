
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAutoplayNavigation = (
  nextLesson: { id: string; title: string; type: string } | null,
  courseId: string | undefined
) => {
  const [autoplay, setAutoplay] = useState(true);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const navigate = useNavigate();

  const toggleAutoplay = () => {
    setAutoplay(!autoplay);
    // Salva a preferência do usuário no localStorage
    localStorage.setItem('lessonAutoplay', (!autoplay).toString());
  };

  useEffect(() => {
    // Carrega a preferência do usuário do localStorage
    const savedAutoplay = localStorage.getItem('lessonAutoplay');
    if (savedAutoplay !== null) {
      setAutoplay(savedAutoplay === 'true');
    }
  }, []);

  const handleVideoEnd = () => {
    if (nextLesson && autoplay) {
      setShowAutoplayPrompt(true);
      // Aguarda 5 segundos antes de navegar para a próxima aula
      const timer = setTimeout(() => {
        setShowAutoplayPrompt(false);
        navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  };

  return {
    autoplay,
    showAutoplayPrompt,
    toggleAutoplay,
    handleVideoEnd,
    setShowAutoplayPrompt
  };
};
