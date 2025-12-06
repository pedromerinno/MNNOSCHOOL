
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useCourseData = (courseId: string | undefined) => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const { userProfile, user } = useAuth();

  const fetchCourseData = useCallback(async (force = false) => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    // Prevent multiple rapid refreshes (within 2 seconds)
    const now = Date.now();
    if (!force && now - lastRefreshTime < 2000) {
      console.log('Skipping refresh - too soon since last refresh');
      return;
    }

    try {
      setLoading(true);
      setLastRefreshTime(now);
      
      console.log(`[useCourseData] Fetching course data for courseId: ${courseId}`);
      
      // Get user first (reuse from context if available)
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      
      // Paralelizar queries críticas para melhor performance
      const queries = [
        // 1. Fetch course details
        supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single(),
        
        // 2. Fetch lessons (pode ser feito em paralelo)
        supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true }),
      ];

      // Se não for super admin, adicionar verificação de acesso
      if (!userProfile?.super_admin && currentUser) {
        queries.push(
          // 3. Get user's companies
          supabase
            .from('user_empresa')
            .select('empresa_id')
            .eq('user_id', currentUser.id)
        );
      }

      // Executar todas as queries em paralelo
      const results = await Promise.all(queries);
      
      const courseResult = results[0];
      const lessonsResult = results[1];
      const userCompaniesResult = userProfile?.super_admin ? null : results[2];

      // Verificar erros do curso
      const { data: courseData, error: courseError } = courseResult;
      
      if (courseError) {
        console.error('[useCourseData] Error fetching course:', courseError);
        throw courseError;
      }
      
      if (!courseData) {
        console.error('[useCourseData] No course found with ID:', courseId);
        throw new Error('Curso não encontrado');
      }

      console.log('[useCourseData] Course found:', courseData.title);
      
      // Verificar acesso se necessário
      if (!userProfile?.super_admin && currentUser && userCompaniesResult) {
        const { data: userCompanies, error: userCompaniesError } = userCompaniesResult;
        
        if (userCompaniesError) {
          console.error('[useCourseData] Error fetching user companies:', userCompaniesError);
          throw userCompaniesError;
        }
        
        if (userCompanies && userCompanies.length > 0) {
          const companyIds = userCompanies.map(uc => uc.empresa_id);
          
          // Check if this course is available to any of user's companies
          const { data: courseAccess, error: accessError } = await supabase
            .from('company_courses')
            .select('course_id')
            .eq('course_id', courseId)
            .in('empresa_id', companyIds);
          
          if (accessError) {
            console.error('[useCourseData] Error checking course access:', accessError);
            throw accessError;
          }
          
          if (!courseAccess || courseAccess.length === 0) {
            console.error('[useCourseData] User does not have access to this course');
            throw new Error('Você não tem acesso a este curso');
          }
        }
      }
      
      // Processar resultados das lessons
      const { data: lessonsData, error: lessonsError } = lessonsResult;
      
      if (lessonsError) {
        console.error('[useCourseData] Error fetching lessons:', lessonsError);
        throw lessonsError;
      }
      
      console.log(`[useCourseData] Found ${lessonsData?.length || 0} lessons for course`);
      
      // Buscar progresso do usuário (pode ser feito em paralelo com as outras queries, mas é mais rápido fazer depois)
      let progressData = null;
      if (currentUser) {
        const { data } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', currentUser.id)
          .single();
        progressData = data;
      }
      
      // Combinar dados do curso
      setCourse({
        ...courseData,
        lessons: lessonsData || [],
        progress: progressData?.progress || 0,
        favorite: progressData?.favorite || false,
      });
      
      setError(null);
    } catch (err: any) {
      console.error('[useCourseData] Error fetching course data:', err);
      setError(err);
      // Only show toast for network errors, not for "no rows returned" which is handled by UI
      if (!err.message.includes('no rows returned')) {
        toast.error('Erro ao carregar curso', {
          description: err.message || 'Ocorreu um erro ao carregar os dados do curso.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, lastRefreshTime, userProfile?.super_admin, user]);

  // Add a function to refresh the course data
  const refreshCourseData = useCallback(() => {
    fetchCourseData(true); // Force refresh
  }, [fetchCourseData]);
  
  // Initial data fetch
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  return { course, loading, error, refreshCourseData };
};
