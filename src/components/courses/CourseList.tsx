
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
        console.log("Fetching courses with filter:", filter);
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || '';
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        // First, get all courses
        let { data: allCourses, error: coursesError } = await supabase
          .from('courses')
          .select('*');
          
        if (coursesError) {
          throw coursesError;
        }
        
        let availableCourses: Course[] = allCourses || [];
        
        // If a company is selected, filter the courses based on company access
        if (selectedCompany) {
          console.log("Selected company:", selectedCompany.nome);
          
          try {
            // Try to find all course IDs accessible to this company
            // We use type assertion because the company_course_access table isn't in TS types yet
            const { data: companyAccess, error: accessError } = await supabase
              .from('company_course_access')
              .select('course_id')
              .eq('company_id', selectedCompany.id);
            
            if (accessError) {
              console.error("Error getting company course access:", accessError);
              console.log("Using fallback: showing all courses");
            } else if (companyAccess && companyAccess.length > 0) {
              // Filter the courses based on company access
              // Use type assertion to handle the missing TypeScript types
              const accessibleCourseIds = companyAccess.map(access => (access as any).course_id);
              availableCourses = allCourses?.filter(course => 
                accessibleCourseIds.includes(course.id)
              ) || [];
              
              console.log(`Found ${availableCourses.length} courses for company`);
            } else {
              // No courses found for this company
              console.log("No courses found for this company");
              availableCourses = [];
            }
          } catch (error) {
            console.error("Error processing company access:", error);
            // Fallback to showing all courses
            console.log("Error with company access, using fallback: showing all courses");
          }
        }
        
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
