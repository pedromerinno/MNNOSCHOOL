import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

// Variantes de animação para stagger effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

interface ScrollSectionProps {
  /**
   * Conteúdo da seção
   */
  children: ReactNode;
  
  /**
   * ID único da seção (para navegação)
   */
  id?: string;
  
  /**
   * Classe CSS adicional
   */
  className?: string;
  
  /**
   * Delay da animação em segundos
   */
  delay?: number;
  
  /**
   * Direção da animação de entrada
   */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  
  /**
   * Se deve aplicar padding vertical
   */
  withPadding?: boolean;
  
  /**
   * Título da seção (opcional)
   */
  title?: string;
  
  /**
   * Subtítulo da seção (opcional)
   */
  subtitle?: string;
  
  /**
   * Cor da empresa para estilização
   */
  companyColor?: string;
}

/**
 * Componente de seção que aparece com animação ao entrar na viewport
 * 
 * @example
 * ```tsx
 * <ScrollSection
 *   id="cultura"
 *   title="Cultura da Empresa"
 *   direction="up"
 *   delay={0.1}
 * >
 *   <CultureContent />
 * </ScrollSection>
 * ```
 */
export const ScrollSection: React.FC<ScrollSectionProps> = ({
  children,
  id,
  className = '',
  delay = 0,
  direction = 'up',
  withPadding = true,
  title,
  subtitle,
  companyColor,
}) => {
  const { ref, inView } = useInView({ 
    threshold: 0.1,
    triggerOnce: true 
  });

  // Configurar animação baseada na direção
  const getAnimationVariants = () => {
    const baseDistance = 20;
    
    switch (direction) {
      case 'up':
        return {
          hidden: { opacity: 0, y: baseDistance },
          visible: { opacity: 1, y: 0 },
        };
      case 'down':
        return {
          hidden: { opacity: 0, y: -baseDistance },
          visible: { opacity: 1, y: 0 },
        };
      case 'left':
        return {
          hidden: { opacity: 0, x: baseDistance },
          visible: { opacity: 1, x: 0 },
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: -baseDistance },
          visible: { opacity: 1, x: 0 },
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id={id}
      className={cn(
        'relative',
        withPadding && 'py-4 lg:py-6',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6 lg:mb-8">
          {title && (
            <h2 
              className="text-2xl lg:text-3xl font-medium text-gray-900 dark:text-white mb-2"
              style={companyColor ? { color: companyColor } : {}}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={containerVariants}
        transition={{ 
          duration: 0.4, 
          delay: delay,
          ease: 'easeOut'
        }}
      >
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
};

