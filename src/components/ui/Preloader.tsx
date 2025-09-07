
import { useState, useEffect } from "react";

interface PreloaderProps {
  duration?: number;
  children?: React.ReactNode;
}

export const Preloader = ({ duration = 2000, children }: PreloaderProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-fade-in">
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
