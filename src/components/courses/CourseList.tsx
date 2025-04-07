
import React, { useEffect, useState } from 'react';
import { CourseCard } from './CourseCard';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';

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
        
        // Get all courses first
        const { data: allCourses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description, image_url, instructor');
        
        if (coursesError) {
          throw coursesError;
        }

        // Get user ID
        const userId = (await supabase.auth.getUser()).data.user?.id || '';
        
        // Get user's course progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('course_id, progress, completed')
          .eq('user_id', userId);
          
        if (progressError) {
          console.error('Error fetching progress:', progressError);
        }
        
        // Get filtered courses if a company is selected
        let filteredCourses = allCourses || [];
        
        if (selectedCompany) {
          // Get company courses - FIX: add alias to avoid ambiguous column reference
          const { data: companyCourses, error: companyCoursesError } = await supabase
            .from('company_courses')
            .select('company_courses.course_id')
            .eq('company_courses.company_id', selectedCompany.id);
            
          if (companyCoursesError) {
            console.error('Error fetching company courses:', companyCoursesError);
          } else if (companyCourses) {
            // Create an array of course IDs for this company
            const companyCourseIds = companyCourses.map(cc => cc.course_id);
            
            // Filter out courses that don't belong to this company
            filteredCourses = allCourses?.filter(course => 
              companyCourseIds.includes(course.id)
            ) || [];
          }
        }
        
        // Add progress information to the courses
        const formattedCourses = filteredCourses.map(course => {
          const userProgress = progressData?.find(progress => progress.course_id === course.id);
          return {
            ...course,
            progress: userProgress?.progress || 0,
            completed: userProgress?.completed || false
          };
        });
        
        // Apply the filter if specified
        let finalCourses = formattedCourses;
        
        if (filter === 'in-progress') {
          finalCourses = formattedCourses.filter(course => 
            (course.progress || 0) > 0 && !(course.completed || false)
          );
        } else if (filter === 'completed') {
          finalCourses = formattedCourses.filter(course => 
            course.completed || false
          );
        } else if (filter === 'not-started') {
          finalCourses = formattedCourses.filter(course => 
            (course.progress || 0) === 0
          );
        }
        
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
    <div>
      <h2 className="text-xl font-medium mb-4">{title}</h2>
      
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
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum curso encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};
