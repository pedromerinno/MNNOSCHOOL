
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Loader2, 
  PlusCircle, 
  Pencil, 
  Trash, 
  AlertCircle,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Course } from '../courses/types';
import { Company } from '@/types/company';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyCoursesManager } from '../CompanyCoursesManager';

interface CompanyCourseManagementProps {
  company: Company;
}

export const CompanyCourseManagement: React.FC<CompanyCourseManagementProps> = ({ company }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState(false);

  useEffect(() => {
    if (company && company.id) {
      fetchCompanyCourses();
    } else {
      setCourses([]);
      setIsLoading(false);
    }
  }, [company]);

  const fetchCompanyCourses = async () => {
    if (!company || !company.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Buscando cursos para empresa: ${company.nome} (${company.id})`);
      
      // Primeiro, buscar os IDs dos cursos associados a esta empresa
      const { data: companyCoursesData, error: companyCoursesError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', company.id);
        
      if (companyCoursesError) throw companyCoursesError;
      
      if (!companyCoursesData || companyCoursesData.length === 0) {
        console.log("Nenhum curso encontrado para esta empresa");
        setCourses([]);
        setIsLoading(false);
        return;
      }
      
      const courseIds = companyCoursesData.map(item => item.course_id);
      console.log(`Encontrados ${courseIds.length} IDs de cursos`);
      
      // Agora, buscar os detalhes dos cursos usando esses IDs
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);
        
      if (coursesError) throw coursesError;
      
      if (coursesData) {
        console.log(`Carregados ${coursesData.length} cursos para a empresa`);
        setCourses(coursesData);
      } else {
        setCourses([]);
      }
    } catch (error: any) {
      console.error("Erro ao buscar cursos da empresa:", error);
      toast.error(`Erro ao carregar cursos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageCourseAccess = (course: Course) => {
    setSelectedCourse(course);
    setIsCompanyManagerOpen(true);
  };

  const handleCompanyAccessSaved = () => {
    fetchCompanyCourses();
    setIsCompanyManagerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Cursos da Empresa</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {company 
              ? `Cursos disponíveis para ${company.nome}` 
              : "Selecione uma empresa para gerenciar seus cursos"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Carregando cursos...</span>
          </CardContent>
        </Card>
      ) : !company ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma empresa selecionada</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Selecione uma empresa para gerenciar seus cursos
            </p>
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Adicione cursos à empresa na aba "Todos os Cursos" no menu principal
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Instrutor</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.instructor || "Não especificado"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {course.description || "Sem descrição"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Diálogo para gerenciar acesso da empresa aos cursos */}
      <Dialog open={isCompanyManagerOpen} onOpenChange={setIsCompanyManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Acesso da Empresa</DialogTitle>
          </DialogHeader>
          
          {selectedCourse && (
            <CompanyCoursesManager
              course={selectedCourse}
              onClose={handleCompanyAccessSaved}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
