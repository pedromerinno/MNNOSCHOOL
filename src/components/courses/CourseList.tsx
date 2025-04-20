
import React, { useEffect, useState } from 'react';
import { CourseCard } from './CourseCard';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

export type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  instructor: string | null;
  progress?: number;
  completed?: boolean;
  tags?: string[];
  favorite?: boolean;
};

type CourseListProps = {
  title: string;
  filter?: 'all' | 'in-progress' | 'completed' | 'not-started';
};

export const CourseList: React.FC<CourseListProps> = ({ title, filter = 'all' }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompany } = useCompanies();
  const { toast } = useToast();

  // Function to fetch courses based on company and filter
  const fetchCourses = async () => {
    try {
      if (!selectedCompany?.id) {
        setCourses([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log(`CourseList: Fetching courses for ${selectedCompany.nome} with filter: ${filter}`);
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '';
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Buscar IDs dos cursos da empresa selecionada
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id);
      
      if (accessError) {
        throw accessError;
      }
      
      // Se não há cursos para esta empresa
      if (!companyAccess || companyAccess.length === 0) {
        console.log("No courses found for this company");
        setCourses([]);
        setLoading(false);
        return;
      }
      
      const accessibleCourseIds = companyAccess.map(access => access.course_id);
      console.log(`Found ${accessibleCourseIds.length} course IDs for company`);
      
      // Buscar os cursos com base nos IDs
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', accessibleCourseIds);
        
      if (coursesError) {
        throw coursesError;
      }
      
      let availableCourses = coursesData || [];
      console.log(`Loaded ${availableCourses.length} courses`);
      
      // Get user's course progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_course_progress')
        .select('course_id, progress, completed, favorite')
        .eq('user_id', userId);
        
      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }
      
      // Add progress information to the courses
      const coursesWithProgress = availableCourses.map(course => {
        const userProgress = progressData?.find(progress => progress.course_id === course.id);
        return {
          ...course,
          progress: userProgress?.progress || 0,
          completed: userProgress?.completed || false,
          favorite: userProgress?.favorite || false
        };
      });
      
      // Apply the filter if specified
      let finalCourses = coursesWithProgress;
      
      if (filter === 'in-progress') {
        finalCourses = coursesWithProgress.filter(course => 
          (course.progress || 0) > 0 && !(course.completed || false)
        );
      } else if (filter === 'completed') {
        finalCourses = coursesWithProgress.filter(course => 
          course.completed || false
        );
      } else if (filter === 'not-started') {
        finalCourses = coursesWithProgress.filter(course => 
          (course.progress || 0) === 0
        );
      }
      
      console.log(`Displaying ${finalCourses.length} courses after filtering`);
      setCourses(finalCourses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Erro ao carregar cursos',
        description: error.message || 'Ocorreu um erro ao buscar os cursos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses when company changes or filter changes
  useEffect(() => {
    fetchCourses();
  }, [selectedCompany?.id, filter]);
  
  // Listen for company selection and course reload events
  useEffect(() => {
    const handleCompanySelected = () => {
      console.log("CourseList: Company selection changed, reloading courses");
      fetchCourses();
    };
    
    const handleReloadCourses = (event: CustomEvent) => {
      if (!selectedCompany) return;
      
      const eventCompanyId = event.detail?.companyId;
      console.log(`CourseList: Reload courses event received for company: ${eventCompanyId}`);
      
      if (eventCompanyId && eventCompanyId === selectedCompany.id) {
        console.log("CourseList: Reloading courses for current company");
        fetchCourses();
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    window.addEventListener('reload-company-courses', handleReloadCourses as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
      window.removeEventListener('reload-company-courses', handleReloadCourses as EventListener);
    };
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg border-gray-200 dark:border-gray-800 text-center">
          <AlertCircle className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Nenhum curso encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {selectedCompany 
              ? `Não foram encontrados cursos para a empresa ${selectedCompany.nome} que correspondam aos filtros selecionados.`
              : 'Por favor, selecione uma empresa para ver os cursos disponíveis.'}
          </p>
        </div>
      )}
    </div>
  );
};
