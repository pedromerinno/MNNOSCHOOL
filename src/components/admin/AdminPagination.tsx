import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  companyColor?: string;
  className?: string;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

// Helper para criar cor com opacidade
const getColorWithOpacity = (color: string, opacity: number) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  companyColor = '#1EAEDB',
  className,
  showPageNumbers = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= maxVisiblePages + 2) {
      // Mostrar todas as páginas se houver poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Sempre mostrar primeira página
    pages.push(1);

    // Calcular páginas visíveis ao redor da atual
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Adicionar ellipsis antes se necessário
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Adicionar páginas ao redor da atual
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Adicionar ellipsis depois se necessário
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Sempre mostrar última página
    pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Informação da página */}
      {showPageNumbers && (
        <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
          Página <strong style={{ color: companyColor }}>{currentPage}</strong> de{' '}
          <strong style={{ color: companyColor }}>{totalPages}</strong>
        </div>
      )}

      {/* Controles de paginação */}
      <div className="flex items-center gap-1">
        {/* Botão Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className={cn(
            'h-9 px-3 transition-all duration-200',
            canGoPrevious
              ? 'hover:shadow-sm'
              : 'opacity-50 cursor-not-allowed'
          )}
          style={
            canGoPrevious
              ? {
                  borderColor: companyColor,
                  color: companyColor,
                  backgroundColor: 'transparent',
                }
              : {}
          }
          onMouseEnter={(e) => {
            if (canGoPrevious) {
              e.currentTarget.style.backgroundColor = getColorWithOpacity(companyColor, 0.1);
            }
          }}
          onMouseLeave={(e) => {
            if (canGoPrevious) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              );
            }

            const isActive = currentPage === page;

            return (
              <Button
                key={page}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  'h-9 w-9 p-0 transition-all duration-200 font-medium',
                  isActive && 'shadow-sm'
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: companyColor,
                        borderColor: companyColor,
                        color: 'white',
                      }
                    : {
                        borderColor: `${companyColor}40`,
                        color: companyColor,
                        backgroundColor: 'transparent',
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = getColorWithOpacity(companyColor, 0.1);
                    e.currentTarget.style.borderColor = companyColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = `${companyColor}40`;
                  }
                }}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Botão Próximo */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={cn(
            'h-9 px-3 transition-all duration-200',
            canGoNext
              ? 'hover:shadow-sm'
              : 'opacity-50 cursor-not-allowed'
          )}
          style={
            canGoNext
              ? {
                  borderColor: companyColor,
                  color: companyColor,
                  backgroundColor: 'transparent',
                }
              : {}
          }
          onMouseEnter={(e) => {
            if (canGoNext) {
              e.currentTarget.style.backgroundColor = getColorWithOpacity(companyColor, 0.1);
            }
          }}
          onMouseLeave={(e) => {
            if (canGoNext) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};




