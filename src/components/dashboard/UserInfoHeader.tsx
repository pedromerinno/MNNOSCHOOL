
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/utils/stringUtils";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

interface UserStatsType {
  completedCourses: number;
  inProgressCourses: number;
  totalAvailableCourses: number;
}

export const UserInfoHeader = () => {
  const { userProfile, user } = useAuth();
  const { selectedCompany } = useCompanies();
  const [stats, setStats] = useState<UserStatsType>({
    completedCourses: 0,
    inProgressCourses: 0,
    totalAvailableCourses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id || !selectedCompany?.id) return;

      try {
        setIsLoading(true);
        
        // Get courses available to this company
        const { data: companyCourses, error: courseError } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (courseError) throw courseError;
        
        const courseIds = companyCourses.map(cc => cc.course_id);
        
        if (courseIds.length === 0) {
          setStats({
            completedCourses: 0,
            inProgressCourses: 0,
            totalAvailableCourses: 0
          });
          setIsLoading(false);
          return;
        }
        
        // Get user progress for these courses
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('course_id, progress, completed')
          .eq('user_id', user.id)
          .in('course_id', courseIds);
        
        if (progressError) throw progressError;
        
        // Calculate stats
        const completed = progressData?.filter(p => p.completed).length || 0;
        const inProgress = progressData?.filter(p => !p.completed && p.progress > 0).length || 0;
        
        setStats({
          completedCourses: completed,
          inProgressCourses: inProgress,
          totalAvailableCourses: courseIds.length
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user?.id, selectedCompany?.id]);

  // Get user initials for avatar fallback
  const userInitials = userProfile?.display_name ? 
    getInitials(userProfile.display_name) : 
    user?.email ? getInitials(user.email) : "U";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Avatar className="h-16 w-16 mr-4">
            <AvatarImage src={userProfile?.avatar || ""} alt={userProfile?.display_name || "User"} />
            <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">
              {userProfile?.display_name || user?.email?.split('@')[0] || "Usuário"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            
            {userProfile?.cargo_id && (
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
                  <Briefcase className="h-3 w-3" />
                  {userProfile.cargo_id}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-36" />
              <Skeleton className="h-16 w-36" />
              <Skeleton className="h-16 w-36" />
            </>
          ) : (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedCourses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cursos completos</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgressCourses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cursos em progresso</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalAvailableCourses - (stats.completedCourses + stats.inProgressCourses)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cursos não iniciados</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
