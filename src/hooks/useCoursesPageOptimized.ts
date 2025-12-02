
import { useState, useEffect, useCallback, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FilterOption = 'all' | 'newest' | 'popular';

// Cache global melhorado
const companyCoursesCache = new Map<string, {
  featured: any[], 
  all: any[], 
  timestamp: number
}>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export const useCoursesPageOptimized = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [allCompanyCourses, setAllCompanyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allCoursesLoading, setAllCoursesLoading] = useState(false);
  const [lastSelectedCompanyId, setLastSelectedCompanyId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const hasActiveRequest = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Fetch otimizado - definido antes de ser usado
  const fetchCourseData = useCallback(async (force = false) => {
    if (hasActiveRequest.current && !force) {
      console.log("Request already in progress");
      return;
    }

    if (!selectedCompany) {
      console.log("No company selected");
      setLoading(false);
      setAllCoursesLoading(false);
      return;
    }
    
    try {
      hasActiveRequest.current = true;
      
      // Cancelar requisição anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      console.log(`Fetching courses for company: ${selectedCompany.nome}`);
      setLoading(true);
      setAllCoursesLoading(true);
      setLastSelectedCompanyId(selectedCompany.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Buscar acesso da empresa aos cursos
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id)
        .abortSignal(abortControllerRef.current.signal);
      
      if (accessError) throw accessError;
      
      if (!companyAccess || companyAccess.length === 0) {
        console.log(`No courses for company ${selectedCompany.nome}`);
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
        setLoading(false);
        setAllCoursesLoading(false);
        return;
      }
      
      const courseIds = companyAccess.map(access => access.course_id);
      
      // Buscar todos os cursos de uma vez
      const { data: allCoursesData, error: allCoursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .order('created_at', { ascending: false })
        .abortSignal(abortControllerRef.current.signal);
      
      if (allCoursesError) throw allCoursesError;
      
      const courses = allCoursesData || [];
      const featured = courses.slice(0, 5);
      
      // Salvar no cache
      companyCoursesCache.set(selectedCompany.id, {
        featured,
        all: courses,
        timestamp: Date.now()
      });
      
      console.log(`Loaded ${courses.length} courses for ${selectedCompany.nome}`);
      setFeaturedCourses(featured);
      setAllCompanyCourses(courses);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Courses fetch was aborted');
        return;
      }
      
      console.error('Error fetching courses:', error);
      setFeaturedCourses([]);
      setAllCompanyCourses([]);
    } finally {
      setLoading(false);
      setAllCoursesLoading(false);
      initialLoadDone.current = true;
      hasActiveRequest.current = false;
    }
  }, [selectedCompany]);

  // Carregamento imediato do cache
  useEffect(() => {
    if (!selectedCompany) return;
    
    const cached = companyCoursesCache.get(selectedCompany.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Loading courses from cache for company ${selectedCompany.id}`);
      setFeaturedCourses(cached.featured);
      setAllCompanyCourses(cached.all);
      setLoading(false);
      setAllCoursesLoading(false);
      initialLoadDone.current = true;
      return;
    }
    
    // Se não tem cache válido, buscar dados
    fetchCourseData();
  }, [selectedCompany?.id, fetchCourseData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refreshCourses = useCallback(() => {
    if (selectedCompany) {
      // Limpar cache para forçar refetch
      companyCoursesCache.delete(selectedCompany.id);
      fetchCourseData(true);
    }
  }, [fetchCourseData, selectedCompany]);

  const getTitle = () => {
    return selectedCompany 
      ? `Todos os Cursos - ${selectedCompany.nome}` 
      : "Todos os Cursos";
  };

  return {
    activeFilter,
    setActiveFilter,
    featuredCourses,
    allCompanyCourses,
    loading,
    allCoursesLoading,
    companyColor,
    getTitle,
    isDataReady: initialLoadDone.current,
    refreshCourses
  };
};
