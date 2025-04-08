
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        console.log("Fetching courses with filter:", filter);
        console.log("Selected company:", selectedCompany?.nome || "None");
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || '';
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        // Se não há empresa selecionada, não carregamos nenhum curso
        if (!selectedCompany) {
          console.log("No company selected, not loading any courses");
          setCourses([]);
          setLoading(false);
          return;
        }
        
        console.log("Fetching courses for company:", selectedCompany.id);
        
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
          .select('course_id, progress, completed')
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
            completed: userProgress?.completed || false
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
    
    fetchCourses();
  }, [selectedCompany, filter, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-md" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum curso encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {selectedCompany 
              ? `Não foram encontrados cursos para a empresa ${selectedCompany.nome} que correspondam aos filtros selecionados.`
              : 'Por favor, selecione uma empresa para ver os cursos disponíveis.'}
          </p>
        </div>
      )}
    </div>
  );
};
