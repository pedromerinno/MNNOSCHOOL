import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Building, 
  BookOpen, 
  TrendingUp, 
  MessageSquare,
  FileText,
  Activity,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { cn } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalCourses: number;
  totalLessons: number;
  totalCompletedLessons: number;
  totalDiscussions: number;
  activeUsers: number;
  totalDocuments: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  companyColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  loading,
  companyColor = '#1EAEDB'
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-1" />
          {description && <Skeleton className="h-4 w-32" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div 
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: `${companyColor}15`,
            color: companyColor 
          }}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: companyColor }}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center mt-2 text-xs",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <TrendingUp className={cn(
              "h-3 w-3 mr-1",
              !trend.isPositive && "rotate-180"
            )} />
            {Math.abs(trend.value)}% {trend.isPositive ? 'aumento' : 'redução'}
          </div>
        )}
      </CardContent>
    </Card>
  );
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
  const isSuperAdmin = userProfile?.super_admin === true;
  const companyColor = selectedCompany?.cor_principal || '#1EAEDB';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [];

        // Total Users
        if (isSuperAdmin) {
          promises.push(
            supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .then(({ count }) => ({ key: 'totalUsers', value: count || 0 }))
          );
        } else {
          // Para admin regular, contar apenas usuários da empresa selecionada
          if (selectedCompany?.id) {
            promises.push(
              supabase
                .from('user_empresa')
                .select('*', { count: 'exact', head: true })
                .eq('empresa_id', selectedCompany.id)
                .then(({ count }) => ({ key: 'totalUsers', value: count || 0 }))
            );
          }
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

        // Total Courses
        promises.push(
          supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .then(({ count }) => ({ key: 'totalCourses', value: count || 0 }))
        );

        // Total Lessons
        promises.push(
          supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .then(({ count }) => ({ key: 'totalLessons', value: count || 0 }))
        );

        // Completed Lessons
        promises.push(
          supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('completed', true)
            .then(({ count }) => ({ key: 'totalCompletedLessons', value: count || 0 }))
        );

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
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        promises.push(
          supabase
            .from('user_lesson_progress')
            .select('user_id', { count: 'exact', head: false })
            .eq('completed', true)
            .gte('updated_at', thirtyDaysAgo.toISOString())
            .then(({ data }) => {
              const uniqueUsers = new Set(data?.map(d => d.user_id) || []);
              return { key: 'activeUsers', value: uniqueUsers.size };
            })
        );

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

        setStats(prev => ({ ...prev, ...newStats }));
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isSuperAdmin, selectedCompany?.id]);

  const completionRate = stats.totalLessons > 0 
    ? ((stats.totalCompletedLessons / stats.totalLessons) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral das estatísticas da plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isSuperAdmin ? "Total de Usuários" : "Usuários da Empresa"}
          value={stats.totalUsers}
          icon={<Users className="h-4 w-4" />}
          description="Usuários cadastrados"
          loading={loading}
          companyColor={companyColor}
        />
        
        {isSuperAdmin && (
          <StatCard
            title="Total de Empresas"
            value={stats.totalCompanies}
            icon={<Building className="h-4 w-4" />}
            description="Empresas cadastradas"
            loading={loading}
            companyColor={companyColor}
          />
        )}

        <StatCard
          title="Total de Cursos"
          value={stats.totalCourses}
          icon={<BookOpen className="h-4 w-4" />}
          description="Cursos disponíveis"
          loading={loading}
          companyColor={companyColor}
        />

        <StatCard
          title="Total de Lições"
          value={stats.totalLessons}
          icon={<FileText className="h-4 w-4" />}
          description="Lições cadastradas"
          loading={loading}
          companyColor={companyColor}
        />

        <StatCard
          title="Lições Concluídas"
          value={stats.totalCompletedLessons}
          icon={<CheckCircle className="h-4 w-4" />}
          description={`Taxa de conclusão: ${completionRate}%`}
          loading={loading}
          companyColor={companyColor}
        />

        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          icon={<Activity className="h-4 w-4" />}
          description="Últimos 30 dias"
          loading={loading}
          companyColor={companyColor}
        />

        <StatCard
          title="Discussões"
          value={stats.totalDiscussions}
          icon={<MessageSquare className="h-4 w-4" />}
          description={selectedCompany ? `Na empresa atual` : "Total"}
          loading={loading}
          companyColor={companyColor}
        />

        <StatCard
          title="Documentos"
          value={stats.totalDocuments}
          icon={<FileText className="h-4 w-4" />}
          description={selectedCompany ? `Da empresa atual` : "Total"}
          loading={loading}
          companyColor={companyColor}
        />
      </div>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conclusão</CardTitle>
            <CardDescription>
              Percentual de lições concluídas em relação ao total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${completionRate}%`,
                    backgroundColor: companyColor
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{stats.totalCompletedLessons} concluídas</span>
                <span>{stats.totalLessons} total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engajamento</CardTitle>
            <CardDescription>
              Atividade recente da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Usuários ativos (30 dias)</span>
              <span className="font-semibold" style={{ color: companyColor }}>
                {stats.activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Lições concluídas</span>
              <span className="font-semibold" style={{ color: companyColor }}>
                {stats.totalCompletedLessons}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Discussões ativas</span>
              <span className="font-semibold" style={{ color: companyColor }}>
                {stats.totalDiscussions}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
