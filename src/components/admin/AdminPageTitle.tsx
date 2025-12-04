import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface AdminPageTitleProps {
  /**
   * Título principal da página
   */
  title: string;
  
  /**
   * Descrição opcional abaixo do título e no tooltip do ícone "?"
   */
  description?: string;
  
  /**
   * Tamanho do título: 'xl' (padrão para páginas admin) ou 'lg'
   */
  size?: 'lg' | 'xl';
  
  /**
   * Ações/buttons opcionais à direita do título
   */
  actions?: React.ReactNode;
  
  /**
   * Badge ou label opcional ao lado do título
   */
  badge?: React.ReactNode;
  
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Componente padronizado para títulos de páginas admin
 * 
 * @example
 * ```tsx
 * <AdminPageTitle
 *   title="Gerenciamento de Usuários"
 *   description="Gerencie os usuários do sistema e suas permissões"
 *   actions={
 *     <Button onClick={handleCreate}>
 *       Criar Usuário
 *     </Button>
 *   }
 * />
 * ```
 */
export const AdminPageTitle: React.FC<AdminPageTitleProps> = ({
  title,
  description,
  size = 'xl',
  actions,
  badge,
  className
}) => {
  const titleSizeClasses = {
    lg: 'text-xl font-semibold',
    xl: 'text-2xl font-bold tracking-tight'
  };

  return (
    <div className={cn('flex items-start justify-between mb-6 w-full', className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h2 className={cn(
            titleSizeClasses[size],
            'flex items-center gap-2'
          )}>
            {title}
            {badge && (
              <span className="flex-shrink-0">
                {badge}
              </span>
            )}
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex-shrink-0 inline-flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity"
                      aria-label="Mais informações"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h2>
        </div>
        {description && (
          <p className={cn(
            'text-muted-foreground text-sm mt-1'
          )}>
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Versão compacta do título (para uso em diálogos ou seções menores)
 */
export const AdminPageTitleCompact: React.FC<Omit<AdminPageTitleProps, 'size'>> = (props) => {
  return (
    <AdminPageTitle
      {...props}
      size="lg"
      className={cn('mb-4', props.className)}
    />
  );
};

