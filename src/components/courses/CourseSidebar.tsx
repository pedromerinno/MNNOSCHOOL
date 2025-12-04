
import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Clock, Heart, TrendingUp, ChevronRight, Globe, ThumbsUp } from "lucide-react";
import { CourseStats } from "@/hooks/my-courses/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NotificationButton } from "@/components/navigation/NotificationButton";
import { useAuth } from "@/contexts/AuthContext";
import { useSuggestedTopics } from "@/hooks/my-courses/useSuggestedTopics";

interface CourseSidebarProps {
  stats: CourseStats;
  hoursWatched: number;
  onTopicClick?: (topicName: string) => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = memo(({ stats, hoursWatched, onTopicClick }) => {
  const { completed, inProgress, favorites } = stats;
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Usuário';
    return name.split(' ')[0];
  };

  const firstName = useMemo(() => getFirstName(userProfile?.display_name), [userProfile?.display_name]);
  const userInitials = useMemo(() => {
    return userProfile?.display_name
      ? userProfile.display_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';
  }, [userProfile?.display_name]);
  
  // Mock data for the chart - memoized
  const monthlyProgress = useMemo(() => [
    { month: "Jan", hours: 1.2 },
    { month: "Fev", hours: 0.8 },
    { month: "Mar", hours: 2.5 },
    { month: "Abr", hours: 1.7 },
    { month: "Mai", hours: 0.9 },
    { month: "Jun", hours: 1.3 },
    { month: "Jul", hours: 3.2 },
    { month: "Ago", hours: 2.8 },
    { month: "Set", hours: 2.1 },
    { month: "Out", hours: 1.5 },
    { month: "Nov", hours: 2.0 },
    { month: "Dez", hours: 0.5 },
  ], []);
  
  // Find max value for scaling
  const maxHours = useMemo(() => Math.max(...monthlyProgress.map(item => item.hours)), [monthlyProgress]);
  
  // Fetch suggested topics from database
  const { suggestedTopics, loading: topicsLoading } = useSuggestedTopics();
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-6 sticky top-8">
      {/* User Info and Notifications Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage 
              src={userProfile?.avatar || "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png"} 
              alt={firstName}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
              }}
            />
            <AvatarFallback className="bg-purple-500 text-white text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {firstName}
            </p>
            {userProfile?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                {userProfile.email}
              </p>
            )}
          </div>
        </div>
        
        {/* Notifications */}
        <NotificationButton />
      </div>

      {/* Cursos completos card - Increased height */}
      <Card className="overflow-hidden rounded-3xl border-0" style={{ backgroundColor: "#FFF6C9" }}>
        <CardContent className="p-6 min-h-[120px] flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Cursos completos
            </CardTitle>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {String(completed || 0).padStart(2, '0')}
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hours watched chart - Improved design */}
      <Card className="overflow-hidden rounded-3xl border-0" style={{ backgroundColor: "#E4ECFF" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Horas assistidas
            </CardTitle>
            <select className="text-xs bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-gray-700 dark:text-gray-300 font-medium">
              <option>Ano</option>
              <option>Mês</option>
            </select>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {hoursWatched.toFixed(1)}
            </p>
            <span className="text-base text-gray-600 dark:text-gray-400 font-medium">horas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full text-xs font-semibold">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>bom trabalho</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="flex items-end h-32 gap-1.5 mt-3">
            {monthlyProgress.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-600 dark:bg-blue-500 rounded-t-lg" 
                  style={{ 
                    height: `${(item.hours / maxHours) * 100}%`,
                    minHeight: "6px"
                  }}
                ></div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-2 font-medium">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Temas Sugeridos - Improved design */}
      {!topicsLoading && suggestedTopics.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Temas Sugeridos</h3>
          <div className="space-y-3 max-h-[calc(3*4.5rem+2*0.75rem)] overflow-y-auto pr-2">
            {suggestedTopics.map((topic, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between border-0 rounded-2xl h-auto py-4 px-5 transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: topic.color }}
                onClick={() => {
                  if (onTopicClick) {
                    onTopicClick(topic.name);
                  } else {
                    // Default behavior: navigate to sugeridos page
                    navigate(`/sugeridos?topic=${encodeURIComponent(topic.name)}`);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-gray-800/60 flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-base text-gray-900 dark:text-white">{topic.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
CourseSidebar.displayName = 'CourseSidebar';
