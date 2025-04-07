
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
        
        // Fetch courses based on the selected company or all courses if admin
        let query = supabase.from('courses').select(`
          id, 
          title, 
          description, 
          image_url, 
          instructor,
          user_course_progress (progress, completed)
        `);
        
        // If a company is selected, filter courses for that company
        if (selectedCompany) {
          query = query.eq('company_courses.company_id', selectedCompany.id)
            .eq('user_course_progress.user_id', supabase.auth.getUser())
            .limit(10);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our Course type
        let formattedCourses: Course[] = [];
        
        if (data) {
          formattedCourses = data.map(course => {
            const progress = course.user_course_progress?.[0]?.progress || 0;
            const completed = course.user_course_progress?.[0]?.completed || false;
            
            return {
              id: course.id,
              title: course.title,
              description: course.description,
              image_url: course.image_url,
              instructor: course.instructor,
              progress,
              completed
            };
          });
          
          // Apply filtering if specified
          if (filter === 'in-progress') {
            formattedCourses = formattedCourses.filter(course => 
              (course.progress || 0) > 0 && !(course.completed || false)
            );
          } else if (filter === 'completed') {
            formattedCourses = formattedCourses.filter(course => 
              course.completed || false
            );
          } else if (filter === 'not-started') {
            formattedCourses = formattedCourses.filter(course => 
              (course.progress || 0) === 0
            );
          }
        }
        
        setCourses(formattedCourses);
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
