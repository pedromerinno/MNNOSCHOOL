
import { useState, useEffect, useCallback, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FilterOption = 'all' | 'newest' | 'popular';

export const useCoursesPage = () => {
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
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

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Debounce timer for realtime updates
  const realtimeDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const fetchCourseDataRef = useRef<((retry?: boolean) => Promise<void>) | null>(null);

  // Debounced fetch function for realtime updates
  const debouncedFetch = useCallback(() => {
    if (realtimeDebounceTimer.current) {
      clearTimeout(realtimeDebounceTimer.current);
    }
    realtimeDebounceTimer.current = setTimeout(() => {
      if (!hasActiveRequest.current && fetchCourseDataRef.current) {
        fetchCourseDataRef.current();
      }
    }, 2000); // Wait 2 seconds before fetching after realtime event
  }, []);

  // Setup and cleanup realtime subscription
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
        debouncedFetch();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses'
      }, (payload) => {
        console.log('Course change detected:', payload);
        debouncedFetch();
      })
      .subscribe();
    
    realtimeChannel.current = channel;
    
    return () => {
      console.log('Cleaning up realtime subscription for company courses');
      if (realtimeDebounceTimer.current) {
        clearTimeout(realtimeDebounceTimer.current);
      }
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [selectedCompany?.id, debouncedFetch]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCourseData = useCallback(async (retry = false) => {
    // Se já tiver uma requisição ativa, não inicia outra
    if (hasActiveRequest.current) {
      console.log("Já existe uma requisição ativa para buscar cursos, ignorando.");
      return;
    }

    if (!selectedCompany) {
      // If we don't have a selected company yet, but we haven't tried many times,
      // we can schedule another attempt
      if (fetchAttempts.current < maxRetries && retry) {
        fetchAttempts.current += 1;
        console.log(`No company selected yet, scheduling retry attempt ${fetchAttempts.current}/${maxRetries}`);
        setTimeout(() => fetchCourseData(true), 1500); // Aumentado para 1.5 segundos
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
    
    // Reset retry counter when we have a company
    fetchAttempts.current = 0;
    
    // Skip if already fetched for this company
    if (lastSelectedCompanyId === selectedCompany.id && initialLoadDone.current && !retry) {
      console.log(`Already fetched data for company ${selectedCompany.id}`);
      return;
    }
    
    try {
      hasActiveRequest.current = true;
      console.log(`Fetching course data for company: ${selectedCompany.nome}`);
      setLoading(true);
      setAllCoursesLoading(true);
      setLastSelectedCompanyId(selectedCompany.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Usar userProfile do contexto se disponível, caso contrário buscar
      // Paralelizar queries de empresa do usuário e company access
      const [userCompanyResult, companyAccessResult] = await Promise.all([
        supabase
          .from('user_empresa')
          .select('cargo_id, is_admin')
          .eq('user_id', user.id)
          .eq('empresa_id', selectedCompany.id)
          .single(),
        supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id)
      ]);
      
      const { data: userCompany } = userCompanyResult;
      const { data: companyAccess, error: accessError } = companyAccessResult;
      
      if (accessError) {
        console.error("Error fetching company access:", accessError);
        throw accessError;
      }
      
      // Usar userProfile do contexto (já carregado) em vez de fazer query separada
      const isSuperAdmin = userProfile?.super_admin === true;
      const isAdmin = isSuperAdmin || (userCompany?.is_admin === true);
      const userJobRoleId = userCompany?.cargo_id || null;
      
      console.log('User company data for courses page:', { isAdmin, isSuperAdmin, userJobRoleId });
      
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
      console.log('All company course IDs:', courseIds);
      
      // Buscar course_job_roles apenas se necessário (não é admin)
      let availableCourseIds = courseIds;
      
      if (!isAdmin) {
        // Get courses with job role restrictions
        const { data: courseJobRoles } = await supabase
          .from('course_job_roles')
          .select('course_id, job_role_id')
          .in('course_id', courseIds);
        
        console.log('Course job roles restrictions:', courseJobRoles);
        console.log('User job role ID:', userJobRoleId);
        
        if (courseJobRoles && courseJobRoles.length > 0) {
          // Get all courses that have role restrictions
          const restrictedCourseIds = [...new Set(courseJobRoles.map(cjr => cjr.course_id))];
          console.log('Courses with role restrictions:', restrictedCourseIds);
          
          // Get courses without any restrictions (available to all)
          const unrestrictedCourseIds = courseIds.filter(id => !restrictedCourseIds.includes(id));
          console.log('Unrestricted courses:', unrestrictedCourseIds);
          
          // Get courses that the user can access based on their job role
          let accessibleRestrictedCourses: string[] = [];
          if (userJobRoleId) {
            accessibleRestrictedCourses = courseJobRoles
              .filter(cjr => cjr.job_role_id === userJobRoleId)
              .map(cjr => cjr.course_id);
            console.log('Accessible restricted courses for user role:', accessibleRestrictedCourses);
          }
          
          // Combine unrestricted courses and accessible restricted courses
          availableCourseIds = [...unrestrictedCourseIds, ...accessibleRestrictedCourses];
        }
      }
      
      console.log('Final available course IDs for user:', availableCourseIds);
      
      if (availableCourseIds.length === 0) {
        console.log(`No accessible courses for user in company ${selectedCompany.nome}`);
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
        return;
      }
      
      // Paralelizar busca de featured courses e all courses
      const [featuredResult, allCoursesResult] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .in('id', availableCourseIds)
          .limit(5),
        supabase
          .from('courses')
          .select('*')
          .in('id', availableCourseIds)
          .order('created_at', { ascending: false })
      ]);
      
      const { data: featuredCoursesData, error: featuredError } = featuredResult;
      const { data: allCoursesData, error: allCoursesError } = allCoursesResult;
      
      if (featuredError) {
        console.error("Error fetching featured courses:", featuredError);
        throw featuredError;
      }
      
      if (allCoursesError) {
        console.error("Error fetching all courses:", allCoursesError);
        throw allCoursesError;
      }
      
      // Atualizar featured courses primeiro para mostrar carousel mais rápido
      if (featuredCoursesData && featuredCoursesData.length > 0) {
        console.log(`Fetched ${featuredCoursesData.length} featured courses`);
        setFeaturedCourses(featuredCoursesData);
        setLoading(false); // Marcar loading como false quando featured courses estiverem prontos
      } else {
        setFeaturedCourses([]);
        setLoading(false);
      }
      
      if (allCoursesData && allCoursesData.length > 0) {
        console.log(`Fetched ${allCoursesData.length} total accessible courses`);
        setAllCompanyCourses(allCoursesData);
      } else {
        setAllCompanyCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setFeaturedCourses([]);
      setAllCompanyCourses([]);
    } finally {
      setAllCoursesLoading(false);
      initialLoadDone.current = true;
      hasActiveRequest.current = false;
    }
  }, [selectedCompany, lastSelectedCompanyId]);

  // Update ref when fetchCourseData changes
  useEffect(() => {
    fetchCourseDataRef.current = fetchCourseData;
  }, [fetchCourseData]);

  // Run the fetch only when selectedCompany changes or on component mount
  useEffect(() => {
    if (selectedCompany && fetchCourseDataRef.current) {
      fetchCourseDataRef.current();
    } else if (!initialLoadDone.current && fetchCourseDataRef.current) {
      // If no company is selected yet, but it's our first load
      // Try to fetch with retries
      fetchCourseDataRef.current(true);
    }
  }, [selectedCompany?.id]); // Only depend on company ID, not the whole object

  // Listen for company selection events to refresh data
  useEffect(() => {
    const handleCompanySelected = () => {
      if (selectedCompany && !hasActiveRequest.current && fetchCourseDataRef.current) {
        console.log("Company selection event detected in useCoursesPage, refreshing data");
        fetchCourseDataRef.current();
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
    };
  }, [selectedCompany?.id]); // Only depend on company ID

  // Expose refresh method
  const refreshCourses = useCallback(() => {
    if (selectedCompany && !hasActiveRequest.current && fetchCourseDataRef.current) {
      console.log("Manually refreshing courses data");
      fetchCourseDataRef.current(true);
    }
  }, [selectedCompany?.id]); // Only depend on company ID

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
