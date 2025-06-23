
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2, Building, Image, MoreHorizontal } from "lucide-react";
import { Course } from './CourseManagement';
import { Skeleton } from "@/components/ui/skeleton";
import { deleteCourse } from '@/services/course';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const CourseTable: React.FC<CourseTableProps> = ({ 
  courses, 
  loading, 
  onEdit,
  onDelete,
  onManageCompanies,
  onViewLessons
}) => {
  const navigate = useNavigate();

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

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        <Table>
          <TableHeader className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 w-16">Capa</TableHead>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Título</TableHead>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Instrutor</TableHead>
              <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 hidden md:table-cell">Descrição</TableHead>
              <TableHead className="text-right text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 w-10">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-9 w-9 ml-auto rounded-md" />
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
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 w-16">Capa</TableHead>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Título</TableHead>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4">Instrutor</TableHead>
            <TableHead className="text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 hidden md:table-cell">Descrição</TableHead>
            <TableHead className="text-right text-[#8E9196] dark:text-gray-400 font-medium text-xs uppercase tracking-wider py-4 w-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum curso encontrado
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                <TableCell className="py-3">
                  {course.image_url ? (
                    <img 
                      src={course.image_url} 
                      alt={course.title} 
                      className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCourseClick(course.id)}
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop&crop=center" 
                      alt="Capa padrão do curso" 
                      className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCourseClick(course.id)}
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-3">
                  <span 
                    className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    {course.title}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 py-3">{course.instructor || '-'}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 hidden md:table-cell py-3">
                  {course.description 
                    ? course.description.length > 60 
                      ? `${course.description.substring(0, 60)}...` 
                      : course.description 
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewLessons && (
                        <DropdownMenuItem onClick={() => onViewLessons(course)}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Aulas</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(course)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageCompanies(course)}>
                        <Building className="mr-2 h-4 w-4" />
                        <span>Empresas</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
