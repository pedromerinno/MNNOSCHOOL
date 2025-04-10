import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Course } from './types';

export const useCourses = (companyId?: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      let query;
      
      if (companyId) {
        // If companyId is provided, fetch only courses for this company
        console.log(`Fetching courses for company: ${companyId}`);
        
        // First, get the course IDs associated with this company
        const { data: companyCourses, error: companyCoursesError } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', companyId);
          
        if (companyCoursesError) {
          throw companyCoursesError;
        }
        
        if (!companyCourses || companyCourses.length === 0) {
          console.log("No courses found for this company");
          setCourses([]);
          setIsLoading(false);
          return;
        }
        
        const courseIds = companyCourses.map(cc => cc.course_id);
        
        // Then fetch the actual courses
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        console.log(`Loaded ${data?.length || 0} courses for company ${companyId}`);
        setCourses(data || []);
      } else {
        // Otherwise, fetch all courses
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        console.log("Cursos carregados com sucesso:", data?.length || 0);
        setCourses(data || []);
      }
    } catch (error: any) {
      console.error("Erro ao carregar cursos:", error);
      toast({
        title: 'Erro ao carregar cursos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, [companyId]); // Add companyId as a dependency to refetch when it changes

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', courseId);

        if (error) {
          throw error;
        }

        toast({
          title: 'Curso excluído',
          description: 'O curso foi excluído com sucesso.',
        });

        // Refresh the list
        fetchCourses();
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir curso',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormSubmit = async (data: Omit<Course, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (selectedCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            instructor: data.instructor,
          })
          .eq('id', selectedCourse.id);

        if (error) {
          throw error;
        }

        toast({
          title: 'Curso atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert([{
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            instructor: data.instructor,
          }]);

        if (error) {
          throw error;
        }

        toast({
          title: 'Curso criado',
          description: 'O novo curso foi criado com sucesso.',
        });
      }

      setIsFormOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar curso',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    courses,
    isLoading,
    selectedCourse,
    setSelectedCourse,
    isFormOpen,
    setIsFormOpen,
    isCompanyManagerOpen,
    setIsCompanyManagerOpen,
    isSubmitting,
    setIsSubmitting,
    fetchCourses,
    handleDeleteCourse,
    handleFormSubmit
  };
};
