
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";

export const useCoursesPage = () => {
  const { selectedCompany } = useCompanies();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [allCompanyCourses, setAllCompanyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  useEffect(() => {
    const fetchCourses = async () => {
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
          setAllCompanyCourses([]);
          setLoading(false);
          return;
        }
        
        const courseIds = companyAccess.map(access => access.course_id);
        
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
          
        if (coursesData) {
          setFeaturedCourses(coursesData.slice(0, 5)); // First 5 courses for the carousel
          setAllCompanyCourses(coursesData); // All courses for the grid
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [selectedCompany]);

  return {
    featuredCourses,
    allCompanyCourses,
    loading,
    companyColor
  };
};
