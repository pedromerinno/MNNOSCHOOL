
import React, { useEffect, useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseTable } from './CourseTable';
import { CourseForm } from './CourseForm';
import { CompanyCoursesManager } from './CompanyCoursesManager';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  instructor: string | null;
  created_at: string;
};

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);
  const { toast } = useToast();

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Cursos carregados com sucesso:", data?.length || 0);
      setCourses(data || []);
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
  }, []);

  const handleCreateCourse = () => {
    setSelectedCourse(undefined);
    setIsFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

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

  const handleManageCompanies = (course: Course) => {
    setSelectedCourse(course);
    setIsCompanyManagerOpen(true);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Cursos</h2>
        <Button onClick={handleCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>
      
      <CourseTable 
        courses={courses} 
        loading={isLoading} 
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
        onManageCompanies={handleManageCompanies}
      />

      {/* Course Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Editar Curso' : 'Criar Novo Curso'}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse 
                ? 'Atualize os detalhes do curso abaixo.' 
                : 'Preencha o formulário para criar um novo curso.'}
            </DialogDescription>
          </DialogHeader>
          <CourseForm 
            initialData={selectedCourse}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Company Courses Manager Dialog */}
      <Dialog open={isCompanyManagerOpen} onOpenChange={setIsCompanyManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Empresas para {selectedCourse?.title}
            </DialogTitle>
            <DialogDescription>
              Adicione ou remova empresas que têm acesso a este curso.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <CompanyCoursesManager 
              course={selectedCourse}
              onClose={() => setIsCompanyManagerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
