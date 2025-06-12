
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/hooks/useUsers";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, MessageSquare } from "lucide-react";

interface TeamMetricsDashboardOptimizedProps {
  members: UserProfile[];
  companyId?: string;
  companyColor?: string;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
  color: string;
}

const MetricCard = ({ title, value, icon, loading, color }: MetricCardProps) => (
  <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
    <CardContent className="flex items-center p-6">
      <div 
        className="rounded-full p-3 mr-4"
        style={{ 
          backgroundColor: `${color}20`
        }}
      >
        <div style={{ color: color }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1">
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            value
          )}
        </h3>
      </div>
    </CardContent>
  </Card>
);

export const TeamMetricsDashboardOptimized = ({ 
  members, 
  companyId, 
  companyColor = "#1EAEDB" 
}: TeamMetricsDashboardOptimizedProps) => {
  const [lessonsWatched, setLessonsWatched] = useState<number>(0);
  const [discussions, setDiscussions] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Memoize member IDs to avoid unnecessary re-fetches
  const memberIds = useMemo(() => members.map(m => m.id), [members]);

  // Fetch metrics data only when necessary
  useEffect(() => {
    if (!companyId || memberIds.length === 0) {
      setLoading(false);
      return;
    }
    
    const fetchMetrics = async () => {
      setLoading(true);
      
      try {
        // Use Promise.allSettled to handle partial failures gracefully
        const [lessonsResult, discussionsResult] = await Promise.allSettled([
          // Get lessons watched count
          supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('completed', true)
            .in('user_id', memberIds),
          
          // Get discussions count
          supabase
            .from('discussions')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
        ]);
        
        // Handle lessons result
        if (lessonsResult.status === 'fulfilled' && !lessonsResult.value.error) {
          setLessonsWatched(lessonsResult.value.count || 0);
        } else {
          console.warn('[TeamMetrics] Error fetching lessons:', lessonsResult);
          setLessonsWatched(0);
        }
        
        // Handle discussions result
        if (discussionsResult.status === 'fulfilled' && !discussionsResult.value.error) {
          setDiscussions(discussionsResult.value.count || 0);
        } else {
          console.warn('[TeamMetrics] Error fetching discussions:', discussionsResult);
          setDiscussions(0);
        }
      } catch (error) {
        console.error('[TeamMetrics] Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [companyId, memberIds]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <MetricCard
        title="Membros cadastrados"
        value={members.length}
        icon={<Users size={24} />}
        loading={false}
        color={companyColor}
      />
      
      <MetricCard
        title="Aulas assistidas"
        value={lessonsWatched}
        icon={<BookOpen size={24} />}
        loading={loading}
        color={companyColor}
      />
      
      <MetricCard
        title="Discussões no fórum"
        value={discussions}
        icon={<MessageSquare size={24} />}
        loading={loading}
        color={companyColor}
      />
    </div>
  );
};
