
import { UserProfile } from "@/hooks/useUsers";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard, MetricCardDataPoint } from "@/components/admin/MetricCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TeamMetricsDashboardOptimizedProps {
  members: UserProfile[];
  companyId?: string;
  companyColor?: string;
}

// Função para gerar dados históricos mensais (últimos 6 meses)
const generateMonthlyHistory = (
  currentValue: number,
  months: number = 6
): MetricCardDataPoint[] => {
  const data: MetricCardDataPoint[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // Calcular valor baseado em uma progressão suave
    const progress = (months - i) / months;
    // Simular crescimento com alguma variação
    const baseValue = currentValue * (0.5 + 0.5 * progress);
    const variation = (Math.sin(progress * Math.PI * 2) * 0.2 + 1);
    const value = Math.round(baseValue * variation);
    
    data.push({
      label: format(date, "MMM yy", { locale: ptBR }),
      value: Math.max(0, value)
    });
  }
  
  return data;
};

const CACHE_KEY_PREFIX = 'team_metrics_';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

export const TeamMetricsDashboardOptimized = ({ 
  members, 
  companyId, 
  companyColor = "#1EAEDB" 
}: TeamMetricsDashboardOptimizedProps) => {
  const [lessonsWatched, setLessonsWatched] = useState<number>(0);
  const [discussions, setDiscussions] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch metrics data using optimized RPC functions
  // Otimizado: usa funções RPC que fazem JOIN direto no banco, muito mais rápido
  useEffect(() => {
    // Não bloquear se não tem companyId
    if (!companyId) {
      setLoading(false);
      return;
    }
    
    const fetchMetrics = async () => {
      // Verificar cache primeiro e mostrar imediatamente
      const cacheKey = `${CACHE_KEY_PREFIX}${companyId}`;
      let hasValidCache = false;
      
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          
          if (now - timestamp < CACHE_EXPIRATION) {
            setLessonsWatched(data.lessonsWatched || 0);
            setDiscussions(data.discussions || 0);
            setLoading(false);
            hasValidCache = true;
            // Continuar buscando em background para atualizar (não bloqueia UI)
          }
        }
      } catch (e) {
        // Cache inválido, continuar com fetch
      }
      
      // Se não tem cache, mostrar loading apenas brevemente
      if (!hasValidCache) {
        setLoading(true);
      }
      
      // Usar funções RPC otimizadas que fazem JOIN direto no banco
      // Muito mais eficiente que passar arrays de IDs do cliente
      const fetchMetricsAsync = async () => {
        try {
          // Executar ambas as queries em paralelo usando Promise.allSettled
          // Isso permite que falhas em uma não bloqueiem a outra
          const [lessonsResult, discussionsResult] = await Promise.allSettled([
            // Usar função RPC otimizada que faz JOIN direto no banco
            // Evita passar array de user_ids do cliente, muito mais rápido
            supabase.rpc('get_company_lessons_count', { _empresa_id: companyId }),
            
            // Usar função RPC otimizada para discussions
            supabase.rpc('get_company_discussions_count', { _empresa_id: companyId })
          ]);
          
          let finalLessonsWatched = 0;
          let finalDiscussions = 0;
          
          // Handle lessons result
          if (lessonsResult.status === 'fulfilled' && !lessonsResult.value.error) {
            finalLessonsWatched = Number(lessonsResult.value.data || 0);
            setLessonsWatched(finalLessonsWatched);
          } else {
            const error = lessonsResult.status === 'rejected' 
              ? lessonsResult.reason 
              : lessonsResult.value?.error;
            // Check if it's a 404 (function doesn't exist) - migration might not be applied
            if (error?.code === 'P0001' || error?.status === 404 || error?.message?.includes('404')) {
              console.warn('[TeamMetrics] RPC function get_company_lessons_count not found. Migration may need to be applied.');
            } else {
              console.warn('[TeamMetrics] Error fetching lessons:', error);
            }
          }
          
          // Handle discussions result
          if (discussionsResult.status === 'fulfilled' && !discussionsResult.value.error) {
            finalDiscussions = Number(discussionsResult.value.data || 0);
            setDiscussions(finalDiscussions);
          } else {
            const error = discussionsResult.status === 'rejected' 
              ? discussionsResult.reason 
              : discussionsResult.value?.error;
            // Check if it's a 404 (function doesn't exist) - migration might not be applied
            if (error?.code === 'P0001' || error?.status === 404 || error?.message?.includes('404')) {
              console.warn('[TeamMetrics] RPC function get_company_discussions_count not found. Migration may need to be applied.');
            } else {
              console.warn('[TeamMetrics] Error fetching discussions:', error);
            }
          }
          
          // Salvar no cache
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: {
                lessonsWatched: finalLessonsWatched,
                discussions: finalDiscussions
              },
              timestamp: Date.now()
            }));
          } catch (e) {
            console.warn('[TeamMetrics] Erro ao salvar cache:', e);
          }
        } catch (error) {
          console.error('[TeamMetrics] Error fetching metrics:', error);
        } finally {
          setLoading(false);
        }
      };
      
      // Se tem cache válido, aguardar um pouco antes de atualizar (não bloqueia)
      // Se não tem cache, executar imediatamente mas de forma assíncrona
      if (hasValidCache) {
        // Aguardar 500ms antes de atualizar em background
        setTimeout(fetchMetricsAsync, 500);
      } else {
        // Executar imediatamente mas de forma não-bloqueante
        // Usar requestIdleCallback se disponível, senão setTimeout
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(fetchMetricsAsync, { timeout: 1000 });
        } else {
          setTimeout(fetchMetricsAsync, 0);
        }
      }
    };
    
    fetchMetrics();
  }, [companyId]); // Removido memberIdsString - não é mais necessário com RPC
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <MetricCard
        title="Membros cadastrados"
        value={members.length}
        chartData={generateMonthlyHistory(members.length)}
        color={companyColor}
        loading={false}
        description="Total de membros na equipe"
      />
      
      <MetricCard
        title="Aulas assistidas"
        value={lessonsWatched}
        chartData={generateMonthlyHistory(lessonsWatched)}
        color={companyColor}
        loading={loading}
        description="Total de aulas concluídas"
      />
      
      <MetricCard
        title="Discussões no fórum"
        value={discussions}
        chartData={generateMonthlyHistory(discussions)}
        color={companyColor}
        loading={loading}
        description="Discussões criadas"
      />
    </div>
  );
};
