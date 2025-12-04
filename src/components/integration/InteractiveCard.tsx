import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  companyColor?: string;
  hoverEffect?: boolean;
  borderBeam?: boolean;
  delay?: number;
}

/**
 * Card interativo com efeitos visuais modernos
 * Inspirado em componentes do 21st.dev
 */
export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className,
  companyColor = '#1EAEDB',
  hoverEffect = true,
  borderBeam = false,
  delay = 0,
}) => {
  // Converter cor hex para RGB para o gradiente
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 30, g: 174, b: 219 };
  };

  const rgb = hexToRgb(companyColor);
  const colorFrom = companyColor;
  const colorTo = `rgb(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative rounded-2xl border border-gray-200/50 dark:border-gray-800/50',
        'overflow-hidden bg-white dark:bg-gray-900',
        hoverEffect && 'transition-all duration-300',
        hoverEffect && 'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20',
        hoverEffect && 'hover:-translate-y-1',
        className
      )}
      whileHover={hoverEffect ? { scale: 1.01 } : undefined}
    >
      {borderBeam && (
        <BorderBeam
          size={250}
          duration={15}
          colorFrom={colorFrom}
          colorTo={colorTo}
          delay={delay}
        />
      )}
      
      {/* Gradient overlay no hover */}
      {hoverEffect && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${colorFrom}08 0%, ${colorTo}05 100%)`,
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

