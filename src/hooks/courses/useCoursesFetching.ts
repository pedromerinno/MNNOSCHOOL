
import { useCallback, MutableRefObject } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCoursesFetching(
  setFeaturedCourses: (courses: any[]) => void,
  setAllCompanyCourses: (courses: any[]) => void,
  setLoading: (loading: boolean) => void,
  setAllCoursesLoading: (loading: boolean) => void,
  setLastSelectedCompanyId: (id: string | null) => void,
  initialLoadDone: MutableRefObject<boolean>
) {
  const fetchCourseData = useCallback(async (forceRefresh = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      const { data: selectedCompanyData } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', user.id)
        .eq('selected', true)
        .maybeSingle();
        
      if (!selectedCompanyData?.empresa_id) {
        console.log("No company selected");
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
        return;
      }
      
      console.log("Fetching courses for company:", selectedCompanyData.empresa_id);
      setLoading(true);
      setAllCoursesLoading(true);
      setLastSelectedCompanyId(selectedCompanyData.empresa_id);
      
      // Fetch company courses
      const { data: companyCoursesData } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompanyData.empresa_id);
        
      if (!companyCoursesData || companyCoursesData.length === 0) {
        console.log("No courses found for company");
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
        return;
      }
      
      const courseIds = companyCoursesData.map(item => item.course_id);
      
      // Fetch featured courses (for carousel)
      const { data: featuredCoursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .limit(5);
        
      if (featuredCoursesData && featuredCoursesData.length > 0) {
        console.log(`Fetched ${featuredCoursesData.length} featured courses`);
        setFeaturedCourses(featuredCoursesData);
      } else {
        setFeaturedCourses([]);
      }
      
      // Fetch all company courses
      const { data: allCoursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);
        
      if (allCoursesData && allCoursesData.length > 0) {
        console.log(`Fetched ${allCoursesData.length} total courses`);
        setAllCompanyCourses(allCoursesData);
      } else {
        setAllCompanyCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setAllCoursesLoading(false);
      initialLoadDone.current = true;
    }
  }, [setFeaturedCourses, setAllCompanyCourses, setLoading, setAllCoursesLoading, setLastSelectedCompanyId, initialLoadDone]);

  return { fetchCourseData };
}
