
import { useState, useEffect, useCallback, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";

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

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCourseData = useCallback(async () => {
    if (!selectedCompany) return;
    
    // Skip if already fetched for this company
    if (lastSelectedCompanyId === selectedCompany.id) return;
    
    try {
      setLoading(true);
      setAllCoursesLoading(true);
      setLastSelectedCompanyId(selectedCompany.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data: companyAccess } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id);
      
      if (!companyAccess || companyAccess.length === 0) {
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
        return;
      }
      
      const courseIds = companyAccess.map(access => access.course_id);
      
      // Featured courses (for carousel)
      const { data: featuredCoursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .limit(5);
      
      if (featuredCoursesData && featuredCoursesData.length > 0) {
        setFeaturedCourses(featuredCoursesData);
      } else {
        setFeaturedCourses([]);
      }
      
      // All company courses
      const { data: allCoursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .order('created_at', { ascending: false });
      
      if (allCoursesData && allCoursesData.length > 0) {
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
    }
  }, [selectedCompany, lastSelectedCompanyId]);

  // Run the fetch only when selectedCompany changes
  useEffect(() => {
    if (selectedCompany && selectedCompany.id !== lastSelectedCompanyId) {
      fetchCourseData();
    }
  }, [selectedCompany, fetchCourseData, lastSelectedCompanyId]);

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
