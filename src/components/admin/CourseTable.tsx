
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2, Building, MoreHorizontal, BookOpen } from "lucide-react";
import { Course } from './CourseManagement';
import { deleteCourse } from '@/services/course';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminTable, AdminTableColumn } from './AdminTable';

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

  const handleDelete = async (courseId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
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

  // Render course cover image
  const renderCover = (course: ExtendedCourse) => {
    if (course.image_url) {
      return (
        <img 
          src={course.image_url} 
          alt={course.title} 
          className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleCourseClick(course.id);
          }}
        />
      );
    }
    
    return (
      <div className="w-12 h-12 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          handleCourseClick(course.id);
        }}
      >
        <BookOpen className="h-6 w-6 text-gray-400" />
      </div>
    );
  };

  // Render actions dropdown
  const renderActions = (course: ExtendedCourse) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onViewLessons && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onViewLessons(course);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Aulas</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(course);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onManageCompanies(course);
          }}
        >
          <Building className="mr-2 h-4 w-4" />
          <span>Empresas</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => handleDelete(course.id, e)}
          className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Define columns
  const columns: AdminTableColumn<ExtendedCourse>[] = [
    {
      id: 'cover',
      header: 'Capa',
      cell: (course) => renderCover(course),
      className: 'w-16',
    },
    {
      id: 'title',
      header: 'Título',
      cell: (course) => (
        <span 
          className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleCourseClick(course.id);
          }}
        >
          {course.title}
        </span>
      ),
    },
    {
      id: 'instructor',
      header: 'Instrutor',
      cell: (course) => (
        <span className="text-gray-600 dark:text-gray-300">
          {course.instructor || '-'}
        </span>
      ),
    },
    {
      id: 'description',
      header: 'Descrição',
      cell: (course) => (
        <span className="text-gray-600 dark:text-gray-300">
          {course.description 
            ? course.description.length > 60 
              ? `${course.description.substring(0, 60)}...` 
              : course.description 
            : '-'
          }
        </span>
      ),
      responsive: { hideBelow: 'md' },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (course) => renderActions(course),
      align: 'right',
      className: 'w-10',
    },
  ];

  return (
    <AdminTable
      data={courses}
      columns={columns}
      loading={loading}
      getRowKey={(course) => course.id}
      emptyState={{
        icon: BookOpen,
        title: 'Nenhum curso encontrado',
        description: 'Comece criando um novo curso',
      }}
    />
  );
};