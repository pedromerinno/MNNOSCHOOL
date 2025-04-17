
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";

type FilterOption = 'all' | 'newest' | 'popular';

export const useCoursesPage = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      if (!selectedCompany) return;
      
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data: companyAccess } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (!companyAccess || companyAccess.length === 0) {
          setFeaturedCourses([]);
          setLoading(false);
          return;
        }
        
        const courseIds = companyAccess.map(access => access.course_id);
        
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds)
          .limit(5); // Get multiple courses for the carousel
        
        if (coursesData && coursesData.length > 0) {
          setFeaturedCourses(coursesData);
        } else {
          setFeaturedCourses([]);
        }
      } catch (error) {
        console.error('Error fetching featured courses:', error);
        setFeaturedCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRecentCourses = async () => {
      if (!selectedCompany) return;
      
      try {
        setRecentLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('course_id, progress, completed, favorite, last_accessed')
          .eq('user_id', user.id)
          .order('last_accessed', { ascending: false })
          .limit(3);
          
        if (progressError) {
          throw progressError;
        }
        
        if (!progressData || progressData.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        const courseIds = progressData.map(item => item.course_id);
        
        const { data: companyAccess } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (!companyAccess || companyAccess.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        const accessibleCourseIds = companyAccess.map(access => access.course_id);
        
        const filteredCourseIds = courseIds.filter(id => 
          accessibleCourseIds.includes(id)
        );
        
        if (filteredCourseIds.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', filteredCourseIds);
          
        if (!coursesData || coursesData.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        const coursesWithProgress = coursesData.map(course => {
          const progress = progressData.find(p => p.course_id === course.id);
          return {
            ...course,
            progress: progress?.progress || 0,
            completed: progress?.completed || false,
            favorite: progress?.favorite || false
          };
        });
        
        coursesWithProgress.sort((a, b) => {
          const progressA = progressData.find(p => p.course_id === a.id);
          const progressB = progressData.find(p => p.course_id === b.id);
          
          if (!progressA?.last_accessed) return 1;
          if (!progressB?.last_accessed) return -1;
          
          return new Date(progressB.last_accessed).getTime() - 
                 new Date(progressA.last_accessed).getTime();
        });
        
        setRecentCourses(coursesWithProgress);
      } catch (error) {
        console.error('Error fetching recent courses:', error);
        setRecentCourses([]);
      } finally {
        setRecentLoading(false);
      }
    };
    
    fetchFeaturedCourses();
    fetchRecentCourses();
  }, [selectedCompany]);

  const getTitle = () => {
    return selectedCompany 
      ? `Todos os Cursos - ${selectedCompany.nome}` 
      : "Todos os Cursos";
  };

  return {
    activeFilter,
    setActiveFilter,
    featuredCourses,
    recentCourses,
    loading,
    recentLoading,
    companyColor,
    getTitle
  };
};
