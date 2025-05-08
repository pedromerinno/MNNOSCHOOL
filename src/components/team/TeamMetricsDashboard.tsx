
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/hooks/useUsers";
import { useCompanies } from "@/hooks/useCompanies";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, MessageSquare } from "lucide-react";

interface TeamMetricsDashboardProps {
  members: UserProfile[];
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

export const TeamMetricsDashboard = ({ members }: TeamMetricsDashboardProps) => {
  const { selectedCompany } = useCompanies();
  const [companyColor, setCompanyColor] = useState("#1EAEDB");
  const [lessonsWatched, setLessonsWatched] = useState<number>(0);
  const [discussions, setDiscussions] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Update color whenever the selected company changes
  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      setCompanyColor(selectedCompany.cor_principal);
    }
  }, [selectedCompany]);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedCompany) return;
      
      setLoading(true);
      
      try {
        // Get lessons watched count
        const { count: lessonsCount, error: lessonsError } = await supabase
          .from('user_lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('completed', true)
          .in('user_id', members.map(m => m.id));
          
        if (lessonsError) throw lessonsError;
        
        // Get discussions count
        const { count: discussionsCount, error: discussionsError } = await supabase
          .from('discussions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', selectedCompany.id);
          
        if (discussionsError) throw discussionsError;
        
        setLessonsWatched(lessonsCount || 0);
        setDiscussions(discussionsCount || 0);
      } catch (error) {
        console.error('Error fetching team metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [selectedCompany, members]);
  
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
