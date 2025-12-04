import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectConfig {
  type: 'select';
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  className?: string;
  defaultValue?: string;
}

export interface FilterTextConfig {
  type: 'text';
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export type FilterConfig = FilterTextConfig | FilterSelectConfig;

export interface AdminFilterBarProps {
  filters: FilterConfig[];
  companyColor?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  hasActiveFilters?: boolean;
  resultsCount?: {
    current: number;
    total: number;
    label?: string;
    showTotalWhenFiltered?: boolean;
    totalCount?: number;
  };
  className?: string;
}

// Helper para criar cor com opacidade
const getColorWithOpacity = (color: string, opacity: number) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  filters,
  companyColor = '#1EAEDB',
  showClearButton = true,
  onClear,
  hasActiveFilters = false,
  resultsCount,
  className,
}) => {
  const textFilters = filters.filter((f) => f.type === 'text');
  const selectFilters = filters.filter((f) => f.type === 'select');

  return (
    <div className={cn('space-y-3', className)}>
      {/* Linha de filtros: Pesquisa + Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Campo de Pesquisa */}
        {textFilters.map((filter) => {
          const textFilter = filter as FilterTextConfig;
          return (
            <div key={textFilter.id} className={cn('relative flex-1 w-full sm:min-w-[250px]', textFilter.className)}>
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none"
                style={{ color: companyColor }}
              />
              <Input
                placeholder={textFilter.placeholder}
                value={textFilter.value}
                onChange={(e) => textFilter.onChange(e.target.value)}
                className="pl-10 pr-10 h-9 text-sm transition-all duration-200"
                style={{
                  borderColor: textFilter.value ? companyColor : undefined,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = companyColor;
                  e.target.style.boxShadow = `0 0 0 2px ${getColorWithOpacity(companyColor, 0.2)}`;
                }}
                onBlur={(e) => {
                  if (!textFilter.value) {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }
                }}
              />
              {textFilter.value && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 transition-colors"
                  onClick={() => textFilter.onChange('')}
                  style={{ color: companyColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = getColorWithOpacity(companyColor, 0.1);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}

        {/* Dropdowns */}
        {selectFilters.map((filter) => {
          const selectFilter = filter as FilterSelectConfig;
          const defaultValue = selectFilter.defaultValue || 'all';
          const isActive = selectFilter.value !== defaultValue;

          return (
            <Select key={selectFilter.id} value={selectFilter.value} onValueChange={selectFilter.onChange}>
              <SelectTrigger
                className={cn(
                  'h-9 w-full sm:w-[180px] text-sm transition-all duration-200',
                  selectFilter.className
                )}
                style={{
                  borderColor: isActive ? companyColor : undefined,
                }}
              >
                <SelectValue placeholder={selectFilter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {selectFilter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-sm">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}

        {/* Botão Limpar */}
        {showClearButton && hasActiveFilters && onClear && (
          <Button
            variant="outline"
            type="button"
            onClick={onClear}
            size="sm"
            className="h-9 whitespace-nowrap border transition-all duration-200"
            style={{
              borderColor: companyColor,
              color: companyColor,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = getColorWithOpacity(companyColor, 0.1);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="h-3 w-3 mr-1.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Contador de resultados - compacto */}
      {resultsCount && (
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <span style={{ color: companyColor }}>
            {resultsCount.label || 'Mostrando'} <strong>{resultsCount.current}</strong> de{' '}
            <strong>{resultsCount.total}</strong>
            {resultsCount.showTotalWhenFiltered &&
              resultsCount.totalCount !== undefined &&
              resultsCount.totalCount !== resultsCount.total && (
                <span className="ml-1">({resultsCount.totalCount} total)</span>
              )}
          </span>
        </div>
      )}
    </div>
  );
};
