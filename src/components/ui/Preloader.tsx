
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8F7F4] dark:bg-[#191919]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-primary"></div>
        </div>
        {children && (
          <div className="text-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
