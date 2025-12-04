import React, { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useUserCompanyRole } from "@/hooks/company/useUserCompanyRole";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { getInitials } from "@/utils/stringUtils";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Crown, Shield } from "lucide-react";

interface UserStatsType {
  completedCourses: number;
  inProgressCourses: number;
  totalAvailableCourses: number;
}

export const UserInfoHeader = () => {
  const { userProfile, user, profileLoading } = useAuth();
  const { selectedCompany } = useCompanies();
  const { jobRole, isLoading: roleLoading } = useUserCompanyRole();
  const { isAdmin, isSuperAdmin, isCompanyAdmin } = useIsAdmin();
  
  // SEMPRE ter um nome para exibir, mesmo sem perfil
  const displayName = userProfile?.display_name || 
                      user?.user_metadata?.display_name || 
                      user?.email?.split('@')[0] || 
                      "Usuário";
  
  const displayEmail = userProfile?.email || user?.email || "";
  
  // Debug: Log detalhado do displayName
  useEffect(() => {
    console.log('[UserInfoHeader] Display name calculation:', {
      'userProfile?.display_name': userProfile?.display_name,
      'user?.user_metadata?.display_name': user?.user_metadata?.display_name,
      'user?.email?.split("@")[0]': user?.email?.split('@')[0],
      'final displayName': displayName,
      'displayEmail': displayEmail
    });
  }, [userProfile, user, displayName, displayEmail]);

  // Debug: Log user info
  useEffect(() => {
    console.log('[UserInfoHeader] User info state:', {
      userProfile: userProfile ? {
        id: userProfile.id,
        display_name: userProfile.display_name,
        email: userProfile.email,
        super_admin: userProfile.super_admin
      } : null,
      user: user ? { id: user.id, email: user.email, user_metadata: user.user_metadata } : null,
      profileLoading,
      jobRole: jobRole ? { id: jobRole.id, title: jobRole.title } : null,
      roleLoading,
      selectedCompany: selectedCompany ? { id: selectedCompany.id, nome: selectedCompany.nome } : null,
      willDisplayName: userProfile?.display_name || user?.email?.split('@')[0] || user?.user_metadata?.display_name || "Usuário"
    });
  }, [userProfile, user, profileLoading, jobRole, roleLoading, selectedCompany]);
  const [stats, setStats] = useState<UserStatsType>({
    completedCourses: 0,
    inProgressCourses: 0,
    totalAvailableCourses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Função memorizada de busca de estatísticas para evitar rerenders
  const fetchUserStats = useCallback(async () => {
    if (!user?.id || !selectedCompany?.id) return;

    try {
      setIsLoading(true);
      
      // Usar chave de cache baseada no usuário e empresa
      const cacheKey = `user_stats_${user.id}_${selectedCompany.id}`;
      const cachedStats = localStorage.getItem(cacheKey);
      
      if (cachedStats) {
        const { data, timestamp } = JSON.parse(cachedStats);
        const now = Date.now();
        
        // Cache de 5 minutos
        if (now - timestamp < 300000) {
          setStats(data);
          setIsLoading(false);
          console.log('Usando estatísticas em cache');
          
          // Continuar carregando em segundo plano
          setTimeout(() => fetchFreshStats(cacheKey), 100);
          return;
        }
      }
      
      // Se não tem cache ou expirou, buscar dados frescos
      await fetchFreshStats(cacheKey);
      
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setIsLoading(false);
    }
  }, [user?.id, selectedCompany?.id]);

  // Função para buscar dados atualizados
  const fetchFreshStats = async (cacheKey: string) => {
    try {
      // Get courses available to this company
      const { data: companyCourses, error: courseError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany?.id);
      
      if (courseError) throw courseError;
      
      const courseIds = companyCourses?.map(cc => cc.course_id) || [];
      
      if (courseIds.length === 0) {
        const newStats = {
          completedCourses: 0,
          inProgressCourses: 0,
          totalAvailableCourses: 0
        };
        
        setStats(newStats);
        localStorage.setItem(cacheKey, JSON.stringify({
          data: newStats,
          timestamp: Date.now()
        }));
        
        setIsLoading(false);
        return;
      }
      
      // Get user progress for these courses
      const { data: progressData, error: progressError } = await supabase
        .from('user_course_progress')
        .select('course_id, progress, completed')
        .eq('user_id', user?.id)
        .in('course_id', courseIds);
      
      if (progressError) throw progressError;
      
      // Calculate stats
      const completed = progressData?.filter(p => p.completed).length || 0;
      const inProgress = progressData?.filter(p => !p.completed && p.progress > 0).length || 0;
      
      const newStats = {
        completedCourses: completed,
        inProgressCourses: inProgress,
        totalAvailableCourses: courseIds.length
      };
      
      setStats(newStats);
      
      // Salvar no cache local
      localStorage.setItem(cacheKey, JSON.stringify({
        data: newStats,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Error fetching fresh user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && selectedCompany?.id) {
      fetchUserStats();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, selectedCompany?.id, fetchUserStats]);

  // Get user initials for avatar fallback
  const userInitials = userProfile?.display_name ? 
    getInitials(userProfile.display_name) : 
    user?.email ? getInitials(user.email) : "U";

  // Validar URL do avatar e usar fallback se necessário
  const getValidAvatarUrl = (url: string | null | undefined): string => {
    if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
      return "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
    }
    
    // Verificar se é uma URL válida
    try {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
        return url;
      }
    } catch {
      // URL inválida
    }
    
    return "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
  };
  
  const avatarUrl = getValidAvatarUrl(userProfile?.avatar);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center">
          {profileLoading ? (
            <div className="h-10 w-10 rounded-full flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={avatarUrl} alt={userProfile?.display_name || "User"} />
              <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div>
            {profileLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold">
                    {displayName}
                  </h2>
                  {isAdmin && (
                    <Badge 
                      variant={isSuperAdmin ? "default" : "secondary"} 
                      className={`flex items-center gap-1 text-xs font-medium ${
                        isSuperAdmin 
                          ? "bg-sky-500 text-white" 
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {isSuperAdmin ? (
                        <>
                          <Shield className="h-3 w-3" />
                          Super Admin
                        </>
                      ) : (
                        <>
                          <Crown className="h-3 w-3" />
                          Admin
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{displayEmail}</p>
                
                {!roleLoading && jobRole && (
                  <div className="flex items-center mt-0.5">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
                      <Briefcase className="h-3 w-3" />
                      {jobRole.title}
                    </Badge>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center col-span-3 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.completedCourses}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Cursos completos</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.inProgressCourses}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Cursos em progresso</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalAvailableCourses - (stats.completedCourses + stats.inProgressCourses)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Cursos não iniciados</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
