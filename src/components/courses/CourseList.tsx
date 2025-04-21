
import React, { useEffect, useState, useRef } from 'react';
import { CourseCard } from './CourseCard';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const { toast } = useToast();
  const initialLoadComplete = useRef(false);
  const currentCompanyId = useRef<string | null>(null);

  // Listen for company update events
  useEffect(() => {
    const handleCompanyUpdate = () => {
      console.log("CourseList: Company update detected, resetting course list");
      setCourses([]);
      initialLoadComplete.current = false;
      currentCompanyId.current = null;
      setLoading(true);
    };
    
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    window.addEventListener('company-relation-changed', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
      window.removeEventListener('company-relation-changed', handleCompanyUpdate);
    };
  }, []);

  useEffect(() => {
    // Reset state when company changes
    if (selectedCompany?.id !== currentCompanyId.current) {
      setCourses([]);
      initialLoadComplete.current = false;
      currentCompanyId.current = selectedCompany?.id || null;
    }

    const fetchCourses = async () => {
      // Don't proceed if no company selected or if company is loading
      if (!selectedCompany || companyLoading) return;

      // Avoid multiple requests at the same time
      if (loading && initialLoadComplete.current && currentCompanyId.current === selectedCompany.id) return;

      try {
        setLoading(true);
        console.log("Fetching courses with filter:", filter);
        console.log("Selected company:", selectedCompany?.nome || "None");
        
        // Fetch data optimized
        const doFetch = async () => {
          // Get user ID
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id || '';
          
          if (!userId) {
            throw new Error('User not authenticated');
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
            initialLoadComplete.current = true;
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
          initialLoadComplete.current = true;
        };

        // Execute data fetch
        await doFetch().catch(error => {
          console.error('Error fetching courses:', error);
          toast({
            title: 'Error loading courses',
            description: error.message || 'An error occurred while fetching courses',
            variant: 'destructive',
          });
        });
      } finally {
        // Ensure loading state is updated
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [selectedCompany, filter, toast, companyLoading, loading]);

  // Mostrar um skeleton mais elegante e consistente com a UI final
  if (companyLoading || (loading && !initialLoadComplete.current)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col rounded-lg overflow-hidden h-[250px]">
            <Skeleton className="h-40 w-full rounded-t-lg" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg border-gray-200 dark:border-gray-800 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
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
