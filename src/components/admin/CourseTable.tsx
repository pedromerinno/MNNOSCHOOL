
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Building, FileText, Image } from "lucide-react";
import { Course } from './CourseManagement';
import { Skeleton } from "@/components/ui/skeleton";
import { deleteCourse } from '@/services/course';
import { toast } from 'sonner';

type ExtendedCourse = Course & {
  companies?: { logo: string | null, nome: string }[];
};

interface CourseTableProps {
  courses: ExtendedCourse[];
  loading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onManageCompanies: (course: Course) => void;
  onViewLessons?: (course: Course) => void;
}

const CourseCompaniesCell: React.FC<{ companies?: { logo: string | null, nome: string }[] }> = ({ companies }) => {
  if (!companies || companies.length === 0) return <span className="text-xs text-gray-400">Nenhuma</span>;
  const maxToShow = 3;
  const showCompanies = companies.slice(0, maxToShow);
  const extra = companies.length - maxToShow;
  return (
    <div className="flex items-center gap-1.5">
      {showCompanies.map((company, idx) =>
        company.logo ? (
          <img
            key={company.nome + idx}
            src={company.logo}
            alt={company.nome}
            className="w-8 h-8 rounded-md object-contain border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-0.5"
          />
        ) : (
          <span key={company.nome + idx} className="rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center w-8 h-8 border border-gray-200 dark:border-gray-700">
            <Image className="w-4 h-4" />
          </span>
        )
      )}
      {extra > 0 && (
        <span className="ml-1.5 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">+{extra}</span>
      )}
    </div>
  );
};

export const CourseTable: React.FC<CourseTableProps> = ({ 
  courses, 
  loading, 
  onEdit,
  onDelete,
  onManageCompanies,
  onViewLessons
}) => {
  const handleDelete = async (courseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      try {
        const success = await deleteCourse(courseId);
        if (success) {
          onDelete?.(courseId);
          toast.success('Curso excluído com sucesso');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Erro ao excluir curso');
      }
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        <Table>
          <TableHeader className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Título</TableHead>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 hidden md:table-cell">Descrição</TableHead>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Instrutor</TableHead>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Empresas</TableHead>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 hidden md:table-cell">Data de Criação</TableHead>
              <TableHead className="text-right text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <Table>
        <TableHeader className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Título</TableHead>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 hidden md:table-cell">Descrição</TableHead>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Instrutor</TableHead>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Empresas</TableHead>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 hidden md:table-cell">Data de Criação</TableHead>
            <TableHead className="text-right text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum curso encontrado
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4">{course.title}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 hidden md:table-cell">
                  {course.description 
                    ? course.description.length > 60 
                      ? `${course.description.substring(0, 60)}...` 
                      : course.description 
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">{course.instructor || '-'}</TableCell>
                <TableCell>
                  <CourseCompaniesCell companies={course.companies} />
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 hidden md:table-cell">{new Date(course.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    {onViewLessons && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewLessons(course)}
                        className="h-8 px-2 bg-transparent dark:bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onManageCompanies(course)}
                      className="h-8 px-2 bg-transparent dark:bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <Building className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(course)}
                      className="h-8 px-2 bg-transparent dark:bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                      className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 bg-transparent dark:bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
