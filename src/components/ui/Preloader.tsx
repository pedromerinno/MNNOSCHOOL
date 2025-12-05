
import { useState, useEffect } from "react";

interface PreloaderProps {
  duration?: number;
  children?: React.ReactNode;
  autoHide?: boolean; // Novo prop para controlar se deve esconder automaticamente
}

export const Preloader = ({ duration = 2000, children, autoHide = false }: PreloaderProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Só esconder automaticamente se autoHide for true
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, autoHide]);

  if (!isVisible && autoHide) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F7F4] dark:bg-[#191919] animate-fade-in">
      <div className="flex flex-col items-center space-y-3 animate-scale-in">
        <div className="relative">
          <div className="w-5 h-5 border border-muted-foreground/20 rounded-full animate-spin border-t-primary transition-all duration-300"></div>
        </div>
        {children && (
          <div className="text-center text-muted-foreground text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
