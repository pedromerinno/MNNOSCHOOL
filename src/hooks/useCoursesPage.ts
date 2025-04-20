
import { useState, useEffect, useCallback, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FilterOption = 'all' | 'newest' | 'popular';

export const useCoursesPage = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [allCompanyCourses, setAllCompanyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCoursesLoading, setAllCoursesLoading] = useState(true);
  const [lastSelectedCompanyId, setLastSelectedCompanyId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const fetchAttempts = useRef(0);
  const maxRetries = 1; // Reduzido para apenas 1 tentativa
  const hasActiveRequest = useRef(false);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

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
    if (lastSelectedCompanyId === selectedCompany.id && initialLoadDone.current) {
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
      
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id);
      
      if (accessError) {
        console.error("Error fetching company access:", accessError);
        throw accessError;
      }
      
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
      
      // Featured courses (for carousel)
      const { data: featuredCoursesData, error: featuredError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .limit(5);
      
      if (featuredError) {
        console.error("Error fetching featured courses:", featuredError);
        throw featuredError;
      }
      
      if (featuredCoursesData && featuredCoursesData.length > 0) {
        console.log(`Fetched ${featuredCoursesData.length} featured courses`);
        setFeaturedCourses(featuredCoursesData);
      } else {
        setFeaturedCourses([]);
      }
      
      // All company courses
      const { data: allCoursesData, error: allCoursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .order('created_at', { ascending: false });
      
      if (allCoursesError) {
        console.error("Error fetching all courses:", allCoursesError);
        throw allCoursesError;
      }
      
      if (allCoursesData && allCoursesData.length > 0) {
        console.log(`Fetched ${allCoursesData.length} total courses`);
        setAllCompanyCourses(allCoursesData);
      } else {
        setAllCompanyCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setFeaturedCourses([]);
      setAllCompanyCourses([]);
    } finally {
      setLoading(false);
      setAllCoursesLoading(false);
      initialLoadDone.current = true;
      hasActiveRequest.current = false;
    }
  }, [selectedCompany, lastSelectedCompanyId]);

  // Run the fetch only when selectedCompany changes or on component mount
  useEffect(() => {
    if (selectedCompany) {
      fetchCourseData();
    } else if (!initialLoadDone.current) {
      // If no company is selected yet, but it's our first load
      // Try to fetch with retries
      fetchCourseData(true);
    }
  }, [selectedCompany, fetchCourseData]);

  // Listen for company selection events to refresh data
  useEffect(() => {
    const handleCompanySelected = () => {
      if (selectedCompany) {
        console.log("Company selection event detected in useCoursesPage, refreshing data");
        fetchCourseData();
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
    };
  }, [selectedCompany, fetchCourseData]);

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
    isDataReady: initialLoadDone.current
  };
};
