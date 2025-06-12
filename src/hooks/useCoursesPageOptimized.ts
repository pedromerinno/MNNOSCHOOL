
import { useState, useEffect, useCallback, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FilterOption = 'all' | 'newest' | 'popular';

// Cache global para cursos por empresa
const companyCoursesCache = new Map<string, {
  featured: any[], 
  all: any[], 
  timestamp: number
}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useCoursesPageOptimized = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [allCompanyCourses, setAllCompanyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCoursesLoading, setAllCoursesLoading] = useState(true);
  const [lastSelectedCompanyId, setLastSelectedCompanyId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const fetchAttempts = useRef(0);
  const maxRetries = 1; 
  const hasActiveRequest = useRef(false);
  const realtimeChannel = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Verificar cache
  const getCachedCourses = useCallback((companyId: string) => {
    const cached = companyCoursesCache.get(companyId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, []);

  // Setup realtime com cleanup melhorado
  useEffect(() => {
    if (!selectedCompany?.id) return;
    
    console.log(`Setting up realtime subscription for company courses: ${selectedCompany.id}`);
    
    const companyId = selectedCompany.id;
    const channel = supabase
      .channel(`company-courses-${companyId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'company_courses',
        filter: `empresa_id=eq.${companyId}`
      }, (payload) => {
        console.log('Company course change detected:', payload);
        // Limpar cache para forçar refetch
        companyCoursesCache.delete(companyId);
        fetchCourseData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses'
      }, (payload) => {
        console.log('Course change detected:', payload);
        // Limpar cache para forçar refetch
        companyCoursesCache.delete(companyId);
        fetchCourseData();
      })
      .subscribe();
    
    realtimeChannel.current = channel;
    
    return () => {
      console.log('Cleaning up realtime subscription for company courses');
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [selectedCompany?.id]);

  // Fetch otimizado com cache e abort controller
  const fetchCourseData = useCallback(async (retry = false) => {
    if (hasActiveRequest.current) {
      console.log("Já existe uma requisição ativa, ignorando.");
      return;
    }

    if (!selectedCompany) {
      if (fetchAttempts.current < maxRetries && retry) {
        fetchAttempts.current += 1;
        console.log(`No company selected yet, scheduling retry attempt ${fetchAttempts.current}/${maxRetries}`);
        setTimeout(() => fetchCourseData(true), 1000);
        return;
      } else if (fetchAttempts.current >= maxRetries) {
        console.log("Max retry attempts reached without a selected company");
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
        return;
      }
      return;
    }
    
    fetchAttempts.current = 0;
    
    // Verificar cache primeiro
    const cached = getCachedCourses(selectedCompany.id);
    if (cached && lastSelectedCompanyId === selectedCompany.id && initialLoadDone.current && !retry) {
      console.log(`Using cached courses for company ${selectedCompany.id}`);
      setFeaturedCourses(cached.featured);
      setAllCompanyCourses(cached.all);
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
      
      console.log(`Fetching course data for company: ${selectedCompany.nome}`);
      setLoading(true);
      setAllCoursesLoading(true);
      setLastSelectedCompanyId(selectedCompany.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id)
        .abortSignal(abortControllerRef.current.signal);
      
      if (accessError) throw accessError;
      
      if (!companyAccess || companyAccess.length === 0) {
        console.log(`No courses found for company ${selectedCompany.nome}`);
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
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
      const featured = courses.slice(0, 5); // Primeiros 5 como featured
      
      // Salvar no cache
      companyCoursesCache.set(selectedCompany.id, {
        featured,
        all: courses,
        timestamp: Date.now()
      });
      
      console.log(`Fetched ${courses.length} total courses`);
      setFeaturedCourses(featured);
      setAllCompanyCourses(courses);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch courses request was aborted');
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
  }, [selectedCompany, lastSelectedCompanyId, getCachedCourses]);

  // Effect principal
  useEffect(() => {
    if (selectedCompany) {
      fetchCourseData();
    } else if (!initialLoadDone.current) {
      fetchCourseData(true);
    }
  }, [selectedCompany, fetchCourseData]);

  // Company selection events
  useEffect(() => {
    const handleCompanySelected = () => {
      if (selectedCompany) {
        console.log("Company selection event detected, refreshing data");
        fetchCourseData();
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
    };
  }, [selectedCompany, fetchCourseData]);

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
      console.log("Manually refreshing courses data");
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
