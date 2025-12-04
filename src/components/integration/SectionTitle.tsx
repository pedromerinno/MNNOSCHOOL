import React from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  /**
   * Título principal da seção
   */
  title: string;
  
  /**
   * Subtítulo/descrição da seção
   */
  subtitle?: string;
  
  /**
   * Cor da empresa para estilização
   */
  companyColor?: string;
  
  /**
   * Classe CSS adicional
   */
  className?: string;
  
  /**
   * Alinhamento do texto
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * Componente padrão para títulos de seções na página de integração
 * 
 * @example
 * ```tsx
 * <SectionTitle
 *   title="Manual de Cultura"
 *   subtitle="Conheça os valores, missão e história da empresa"
 *   companyColor="#1EAEDB"
 * />
 * ```
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  companyColor = '#1EAEDB',
  className,
  align = 'left',
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('mb-6 lg:mb-8', alignClasses[align], className)}>
      <h2 
        className="text-2xl lg:text-3xl xl:text-4xl font-medium text-gray-900 dark:text-white tracking-tight"
        style={companyColor ? { color: companyColor } : {}}
      >
        {title}
      </h2>
    </div>
  );
};

