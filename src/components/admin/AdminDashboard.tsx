import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Users,
  BookOpen
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { AdminPageTitle } from './AdminPageTitle';
import { MetricCard, MetricCardDataPoint } from './MetricCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSafeTextColor, getContrastTextColor } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalCourses: number;
  totalLessons: number;
  totalCompletedLessons: number;
  totalDiscussions: number;
  activeUsers: number;
  totalDocuments: number;
  previousStats?: {
    totalUsers: number;
    activeUsers: number;
    totalCompletedLessons: number;
  };
}

// Função para gerar dados históricos mensais (últimos 12 meses)
const generateMonthlyHistory = (
  currentValue: number,
  months: number = 12
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

// Função para gerar dados mensais de conclusão para o gráfico de barras
const generateMonthlyCompletionData = (currentRate: number) => {
  const data = [];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  
  for (let i = 0; i < 6; i++) {
    // Simular variação mensal baseada na taxa atual
    const variation = 0.8 + (Math.random() * 0.4); // Variação entre 80% e 120%
    const monthlyRate = Math.max(0, Math.min(100, currentRate * variation));
    data.push({
      name: months[i],
      value: Math.round(monthlyRate)
    });
  }
  
  return data;
};

// Função para calcular mudança percentual
const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Função para buscar dados históricos de usuários ativos
const fetchActiveUsersHistory = async (
  companyId: string | undefined,
  isSuperAdmin: boolean
): Promise<MetricCardDataPoint[]> => {
  try {
    const data: MetricCardDataPoint[] = [];
    const now = new Date();
    
    // Buscar dados dos últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      let query = supabase
        .from('user_lesson_progress')
        .select('user_id')
        .eq('completed', true)
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString());
      
      // Se não for super admin e tiver empresa, filtrar por usuários da empresa
      if (!isSuperAdmin && companyId) {
        const { data: companyUsers } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', companyId);
        
        if (companyUsers && companyUsers.length > 0) {
          const userIds = companyUsers.map(cu => cu.user_id);
          query = query.in('user_id', userIds);
        } else {
          // Sem usuários na empresa, retornar 0
          data.push({
            label: format(startDate, "MMM yy", { locale: ptBR }),
            value: 0
          });
          continue;
        }
      }
      
      const { data: progressData } = await query;
      const uniqueUsers = new Set(progressData?.map(d => d.user_id) || []);
      
      data.push({
        label: format(startDate, "MMM yy", { locale: ptBR }),
        value: uniqueUsers.size
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching active users history:', error);
    return [];
  }
};

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalCompletedLessons: 0,
    totalDiscussions: 0,
    activeUsers: 0,
    totalDocuments: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeUsersHistory, setActiveUsersHistory] = useState<MetricCardDataPoint[]>([]);
  const isSuperAdmin = userProfile?.super_admin === true;
  const companyColor = selectedCompany?.cor_principal || '#1EAEDB';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Verificar cache primeiro (5 minutos de duração)
        const cacheKey = `admin_stats_${isSuperAdmin ? 'super' : 'admin'}_${selectedCompany?.id || 'none'}`;
        const cached = localStorage.getItem(cacheKey);
        const now = Date.now();
        let cachedStats: AdminStats | null = null;
        
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            // Cache válido por 5 minutos
            if (now - timestamp < 5 * 60 * 1000) {
              cachedStats = data;
              setStats(data);
              setLoading(false);
              // Continuar carregando em background para atualizar
            }
          } catch (e) {
            // Cache inválido, continuar com fetch
          }
        }

        const promises: Promise<any>[] = [];

        // Total Users - sempre filtrar pela empresa selecionada, mesmo para super admin
        if (selectedCompany?.id) {
          promises.push(
            supabase
              .from('user_empresa')
              .select('*', { count: 'exact', head: true })
              .eq('empresa_id', selectedCompany.id)
              .then(({ count }) => ({ key: 'totalUsers', value: count || 0 }))
          );
        }

        // Total Companies
        if (isSuperAdmin) {
          promises.push(
            supabase
              .from('empresas')
              .select('*', { count: 'exact', head: true })
              .then(({ count }) => ({ key: 'totalCompanies', value: count || 0 }))
          );
        }

        // Total Courses - sempre filtrar pela empresa selecionada, mesmo para super admin
        if (selectedCompany?.id) {
          promises.push(
            supabase
              .from('company_courses')
              .select('course_id', { count: 'exact', head: true })
              .eq('empresa_id', selectedCompany.id)
              .then(({ count }) => ({ key: 'totalCourses', value: count || 0 }))
          );
        }

        // Total Lessons - sempre filtrar pela empresa selecionada, mesmo para super admin
        if (selectedCompany?.id) {
          promises.push(
            supabase
              .from('company_courses')
              .select('course_id')
              .eq('empresa_id', selectedCompany.id)
              .then(async ({ data: companyCourses }) => {
                if (!companyCourses || companyCourses.length === 0) {
                  return { key: 'totalLessons', value: 0 };
                }
                const courseIds = companyCourses.map(cc => cc.course_id);
                const { count } = await supabase
                  .from('lessons')
                  .select('*', { count: 'exact', head: true })
                  .in('course_id', courseIds);
                return { key: 'totalLessons', value: count || 0 };
              })
          );
        }

        // Completed Lessons - sempre filtrar pela empresa selecionada, mesmo para super admin
        if (selectedCompany?.id) {
          promises.push(
            supabase
              .from('user_empresa')
              .select('user_id')
              .eq('empresa_id', selectedCompany.id)
              .then(async ({ data: companyUsers }) => {
                if (!companyUsers || companyUsers.length === 0) {
                  return { key: 'totalCompletedLessons', value: 0 };
                }
                const userIds = companyUsers.map(cu => cu.user_id);
                const { count } = await supabase
                  .from('user_lesson_progress')
                  .select('*', { count: 'exact', head: true })
                  .eq('completed', true)
                  .in('user_id', userIds);
                return { key: 'totalCompletedLessons', value: count || 0 };
              })
          );
        }

        // Total Discussions
        if (selectedCompany?.id) {
          promises.push(
            supabase
              .from('discussions')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', selectedCompany.id)
              .then(({ count }) => ({ key: 'totalDiscussions', value: count || 0 }))
          );
        }

        // Active Users (users who completed at least one lesson in last 30 days)
        // Sempre filtrar pela empresa selecionada, mesmo para super admin
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (selectedCompany?.id) {
          promises.push(
            supabase
              .from('user_empresa')
              .select('user_id')
              .eq('empresa_id', selectedCompany.id)
              .then(async ({ data: companyUsers }) => {
                if (!companyUsers || companyUsers.length === 0) {
                  return { key: 'activeUsers', value: 0 };
                }
                const userIds = companyUsers.map(cu => cu.user_id);
                const { data } = await supabase
                  .from('user_lesson_progress')
                  .select('user_id')
                  .eq('completed', true)
                  .gte('updated_at', thirtyDaysAgo.toISOString())
                  .in('user_id', userIds);
                const uniqueUsers = new Set(data?.map(d => d.user_id) || []);
                return { key: 'activeUsers', value: uniqueUsers.size };
              })
          );
        }

        // Total Documents
        if (selectedCompany?.id) {
          promises.push(
            supabase
              .from('company_documents')
              .select('*', { count: 'exact', head: true })
              .eq('empresa_id', selectedCompany.id)
              .then(({ count }) => ({ key: 'totalDocuments', value: count || 0 }))
          );
        }

        const results = await Promise.allSettled(promises);
        
        const newStats: Partial<AdminStats> = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            const { key, value } = result.value;
            newStats[key as keyof AdminStats] = value;
          }
        });

        // Usar stats do cache como base para comparar
        const baseStats = cachedStats || {
          totalUsers: 0,
          totalCompanies: 0,
          totalCourses: 0,
          totalLessons: 0,
          totalCompletedLessons: 0,
          totalDiscussions: 0,
          activeUsers: 0,
          totalDocuments: 0
        };
        
        const finalStats: AdminStats = { 
          ...baseStats, 
          ...newStats,
          previousStats: {
            totalUsers: baseStats.totalUsers,
            activeUsers: baseStats.activeUsers,
            totalCompletedLessons: baseStats.totalCompletedLessons
          }
        };
        setStats(finalStats);
        
        // Salvar no cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: finalStats,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('Failed to cache admin stats:', e);
        }

        // Buscar histórico de usuários ativos (em background, não bloqueia UI)
        fetchActiveUsersHistory(selectedCompany?.id, isSuperAdmin)
          .then(setActiveUsersHistory)
          .catch(console.error);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isSuperAdmin, selectedCompany?.id]);

  // Calcular mudanças percentuais
  const usersChange = useMemo(() => {
    if (!stats.previousStats) return undefined;
    return calculateChange(stats.totalUsers, stats.previousStats.totalUsers);
  }, [stats.totalUsers, stats.previousStats]);

  const activeUsersChange = useMemo(() => {
    if (!stats.previousStats) return undefined;
    return calculateChange(stats.activeUsers, stats.previousStats.activeUsers);
  }, [stats.activeUsers, stats.previousStats]);

  const completedLessonsChange = useMemo(() => {
    if (!stats.previousStats) return undefined;
    return calculateChange(stats.totalCompletedLessons, stats.previousStats.totalCompletedLessons);
  }, [stats.totalCompletedLessons, stats.previousStats]);

  const completionRate = stats.totalLessons > 0 
    ? ((stats.totalCompletedLessons / stats.totalLessons) * 100).toFixed(1)
    : '0';

  // Gerar dados históricos para os cards principais
  const usersHistory = useMemo(() => generateMonthlyHistory(stats.totalUsers), [stats.totalUsers]);
  const activeUsersChartData = activeUsersHistory.length > 0 ? activeUsersHistory : generateMonthlyHistory(stats.activeUsers);
  const completedLessonsHistory = useMemo(() => generateMonthlyHistory(stats.totalCompletedLessons), [stats.totalCompletedLessons]);

  // Data atual formatada (estilo "On Dec 23")
  const currentDate = format(new Date(), "d 'de' MMM", { locale: ptBR });
  const changeDateLabel = `Em ${currentDate}`;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Dashboard"
        description="Visão geral das estatísticas da plataforma"
        size="xl"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        <MetricCard
          title={isSuperAdmin ? "Total de Usuários" : "Usuários da Empresa"}
          value={stats.totalUsers}
          chartData={usersHistory}
          change={usersChange}
          changeDate={usersChange !== undefined ? changeDateLabel : undefined}
          color={companyColor}
          loading={loading}
          description="Usuários cadastrados"
        />
        

        <MetricCard
          title={isSuperAdmin ? "Total de Cursos" : "Cursos da Empresa"}
          value={stats.totalCourses}
          chartData={generateMonthlyHistory(stats.totalCourses)}
          color={companyColor}
          loading={loading}
          description={isSuperAdmin ? "Cursos disponíveis na plataforma" : `Cursos disponíveis para ${selectedCompany?.nome || 'a empresa'}`}
        />

        <MetricCard
          title="Total de Lições"
          value={stats.totalLessons}
          chartData={generateMonthlyHistory(stats.totalLessons)}
          color={companyColor}
          loading={loading}
          description="Lições cadastradas"
        />

        <MetricCard
          title="Lições Concluídas"
          value={stats.totalCompletedLessons}
          chartData={completedLessonsHistory}
          change={completedLessonsChange}
          changeDate={completedLessonsChange !== undefined ? changeDateLabel : undefined}
          color={companyColor}
          loading={loading}
          description={`Taxa de conclusão: ${completionRate}%`}
        />

        <MetricCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          chartData={activeUsersChartData}
          change={activeUsersChange}
          changeDate={activeUsersChange !== undefined ? changeDateLabel : undefined}
          color={companyColor}
          loading={loading}
          description="Últimos 30 dias"
        />

        <MetricCard
          title="Discussões"
          value={stats.totalDiscussions}
          chartData={generateMonthlyHistory(stats.totalDiscussions)}
          color={companyColor}
          loading={loading}
          description={selectedCompany ? `Na empresa atual` : "Total"}
        />

        <MetricCard
          title="Documentos"
          value={stats.totalDocuments}
          chartData={generateMonthlyHistory(stats.totalDocuments)}
          color={companyColor}
          loading={loading}
          description={selectedCompany ? `Da empresa atual` : "Total"}
        />
      </div>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card de Taxa de Conclusão Melhorado */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg font-semibold">Taxa de Conclusão</CardTitle>
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: `${companyColor}15`,
                  color: getSafeTextColor(companyColor, false)
                }}
              >
                <CheckCircle2 className="h-5 w-5" style={{ color: getSafeTextColor(companyColor, false) }} />
              </div>
            </div>
            <CardDescription className="text-sm">
              Percentual de lições concluídas em relação ao total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Valor principal */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold" style={{ color: getSafeTextColor(companyColor, false) }}>
                  {completionRate}
                </span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{stats.totalCompletedLessons} concluídas</span>
                <span>•</span>
                <span>{stats.totalLessons} total</span>
              </div>
            </div>

            {/* Barra de progresso melhorada */}
            <div className="space-y-2">
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden relative">
                <div
                  className="h-full transition-all duration-700 rounded-full relative"
                  style={{
                    width: `${completionRate}%`,
                    backgroundColor: companyColor
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Gráfico de barras mensais */}
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={generateMonthlyCompletionData(parseFloat(completionRate))}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <Bar 
                    dataKey="value" 
                    radius={[6, 6, 0, 0]}
                  >
                    {generateMonthlyCompletionData(parseFloat(completionRate)).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={companyColor} 
                        opacity={0.7 + (index * 0.05)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card de Engajamento Melhorado */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg font-semibold">Engajamento</CardTitle>
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: `${companyColor}15`,
                  color: getSafeTextColor(companyColor, false)
                }}
              >
                <TrendingUp className="h-5 w-5" style={{ color: getSafeTextColor(companyColor, false) }} />
              </div>
            </div>
            <CardDescription className="text-sm">
              Atividade recente da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Item 1: Usuários Ativos */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${companyColor}15`,
                    color: getSafeTextColor(companyColor, false)
                  }}
                >
                  <Users className="h-5 w-5" style={{ color: getSafeTextColor(companyColor, false) }} />
                </div>
                <div>
                  <p className="text-sm font-medium">Usuários Ativos</p>
                  <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                </div>
              </div>
              <span className="text-2xl font-bold" style={{ color: getSafeTextColor(companyColor, false) }}>
                {stats.activeUsers}
              </span>
            </div>

            {/* Item 2: Lições Concluídas */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${companyColor}15`,
                    color: getSafeTextColor(companyColor, false)
                  }}
                >
                  <BookOpen className="h-5 w-5" style={{ color: getSafeTextColor(companyColor, false) }} />
                </div>
                <div>
                  <p className="text-sm font-medium">Lições Concluídas</p>
                  <p className="text-xs text-muted-foreground">Total geral</p>
                </div>
              </div>
              <span className="text-2xl font-bold" style={{ color: getSafeTextColor(companyColor, false) }}>
                {stats.totalCompletedLessons}
              </span>
            </div>

            {/* Item 3: Discussões Ativas */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${companyColor}15`,
                    color: getSafeTextColor(companyColor, false)
                  }}
                >
                  <MessageSquare className="h-5 w-5" style={{ color: getSafeTextColor(companyColor, false) }} />
                </div>
                <div>
                  <p className="text-sm font-medium">Discussões Ativas</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCompany ? 'Na empresa atual' : 'Total'}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold" style={{ color: getSafeTextColor(companyColor, false) }}>
                {stats.totalDiscussions}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
