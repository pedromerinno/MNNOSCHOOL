import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardDataPoint {
  label: string;
  value: number;
}

export interface MetricCardProps {
  /** Título do card */
  title: string;
  /** Valor principal a ser exibido */
  value: string | number;
  /** Dados para o gráfico de área (opcional) */
  chartData?: MetricCardDataPoint[];
  /** Porcentagem de mudança (positiva ou negativa) */
  change?: number;
  /** Data da mudança (ex: "On Dec 23") */
  changeDate?: string;
  /** Cor do tema (para gráfico e badge) */
  color?: string;
  /** Estado de carregamento */
  loading?: boolean;
  /** Descrição adicional abaixo do valor */
  description?: string;
  /** Classe CSS adicional */
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  chartData,
  change,
  changeDate,
  color = '#1EAEDB',
  loading = false,
  description,
  className
}) => {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4 flex items-center justify-center min-h-[120px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = change !== undefined && change >= 0;
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('pt-BR') 
    : value;

  // Preparar dados do gráfico com área preenchida
  const chartDataWithArea = chartData?.map((point, index, array) => ({
    ...point,
    // Adicionar pontos de referência para criar área
    index
  }));

  // Criar ID único para o gradiente baseado no título
  const gradientId = `gradient-${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full", className)}>
      <div className={cn("p-4 flex flex-col flex-1", !chartData || chartData.length === 0 ? "pb-4" : "")}>
        {/* Header: Título e Badge de tendência */}
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground leading-tight flex-1 pr-2">
            {title}
          </p>
          
          <div className="flex flex-col items-end gap-1 min-w-[80px] text-right flex-shrink-0">
            {change !== undefined ? (
              <>
                <div
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                    isPositiveChange 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  )}
                >
                  {isPositiveChange ? '+' : ''}{change.toFixed(1)}%
                </div>
                {changeDate ? (
                  <p className="text-xs text-muted-foreground leading-tight">
                    {changeDate}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {/* Valor principal */}
        <div className="flex flex-col">
          <h3 className="text-3xl font-bold leading-tight">
            {formattedValue}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground leading-tight mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Gráfico de área - sempre mesma altura e posição */}
      {chartData && chartData.length > 0 && (
        <div className="h-20 w-full px-4 pb-4 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartDataWithArea} margin={{ top: 5, right: 8, left: 8, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickMargin={4}
                interval="preserveStartEnd"
                minTickGap={0}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={true}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

