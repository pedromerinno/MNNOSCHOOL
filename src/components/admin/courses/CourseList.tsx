import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from './types';
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Building, Loader2, Users, FileText, Trash2, MoreHorizontal, BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CourseForm } from '../CourseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyCoursesManager } from '../CompanyCoursesManager';
import { LessonManager } from './LessonManager';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteCourse } from '@/services/course';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdminTable, AdminTableColumn, SortField, SortDirection } from '../AdminTable';
import { AdminFilterBar, FilterConfig } from '../AdminFilterBar';
import { AdminPagination } from '../AdminPagination';

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  isCompanyManagerOpen: boolean;
  setIsCompanyManagerOpen: (isOpen: boolean) => void;
  isSubmitting: boolean;
  showAllCourses?: boolean;
  companyId?: string;
  handleFormSubmit: (data: any) => Promise<void>;
  companyColor?: string;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  isLoading,
  selectedCourse,
  setSelectedCourse,
  isFormOpen,
  setIsFormOpen,
  isCompanyManagerOpen,
  setIsCompanyManagerOpen,
  isSubmitting,
  showAllCourses = false,
  companyId,
  handleFormSubmit,
  companyColor = "#1EAEDB"
}) => {
  const navigate = useNavigate();
  const [isLessonManagerOpen, setIsLessonManagerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Ordenação
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleNewCourse = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleManageCompanies = (course: Course) => {
    setSelectedCourse(course);
    setIsCompanyManagerOpen(true);
  };

  const handleManageLessons = (course: Course) => {
    setSelectedCourse(course);
    setIsLessonManagerOpen(true);
  };

  const confirmDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const success = await deleteCourse(courseToDelete.id);
      if (success) {
        toast.success('Curso excluído com sucesso');
        // Dispatch an event to trigger a re-fetch
        window.dispatchEvent(new CustomEvent('course-deleted', {
          detail: {
            courseId: courseToDelete.id
          }
        }));
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Erro ao excluir curso');
    } finally {
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Extrair instrutores únicos
  const uniqueInstructors = useMemo(() => {
    const instructors = new Set<string>();
    courses.forEach(course => {
      if (course.instructor) {
        instructors.add(course.instructor);
      }
    });
    return Array.from(instructors).sort();
  }, [courses]);

  // Extrair tags únicas
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    courses.forEach(course => {
      if (course.tags && Array.isArray(course.tags)) {
        course.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tags.add(tag.trim());
          }
        });
      }
    });
    return Array.from(tags).sort();
  }, [courses]);

  // Filtrar cursos
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filtro por termo de busca (título e descrição)
      const matchesSearch = searchTerm === '' || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por instrutor
      const matchesInstructor = instructorFilter === 'all' || 
        (instructorFilter === 'none' && !course.instructor) ||
        course.instructor === instructorFilter;
      
      // Filtro por tag
      const matchesTag = tagFilter === 'all' ||
        (course.tags && course.tags.some(tag => tag.trim().toLowerCase() === tagFilter.toLowerCase()));
      
      return matchesSearch && matchesInstructor && matchesTag;
    });
  }, [courses, searchTerm, instructorFilter, tagFilter]);

  // Ordenar cursos
  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'instructor':
          aValue = a.instructor?.toLowerCase() || '';
          bValue = b.instructor?.toLowerCase() || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredCourses, sortField, sortDirection]);

  // Paginar cursos
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedCourses.slice(startIndex, endIndex);
  }, [sortedCourses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, instructorFilter, tagFilter]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setInstructorFilter('all');
    setTagFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || instructorFilter !== 'all' || tagFilter !== 'all';

  // Configurar filtros para o AdminFilterBar
  const filterConfigs: FilterConfig[] = [
    {
      type: 'text',
      id: 'search',
      placeholder: 'Buscar por título ou descrição...',
      value: searchTerm,
      onChange: setSearchTerm,
    },
    {
      type: 'select',
      id: 'instructor',
      placeholder: 'Instrutor',
      value: instructorFilter,
      onChange: setInstructorFilter,
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Todos os instrutores' },
        { value: 'none', label: 'Sem instrutor' },
        ...uniqueInstructors.map(instructor => ({
          value: instructor,
          label: instructor,
        })),
      ],
    },
    {
      type: 'select',
      id: 'tag',
      placeholder: 'Tag',
      value: tagFilter,
      onChange: setTagFilter,
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Todas as tags' },
        ...uniqueTags.map(tag => ({
          value: tag,
          label: tag,
        })),
      ],
    },
  ];

  // Renderizar capa do curso
  const renderCover = (course: Course) => {
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
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
            target.onerror = null;
          }}
        />
      );
    }
    
    return (
      <div 
        className="w-12 h-12 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          handleCourseClick(course.id);
        }}
      >
        <FileText className="h-6 w-6 text-gray-400" />
      </div>
    );
  };

  // Renderizar ações
  const renderActions = (course: Course) => (
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
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          handleManageLessons(course);
        }}>
          <FileText className="h-4 w-4 mr-2" />
          Aulas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          handleEditCourse(course);
        }}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          handleManageCompanies(course);
        }}>
          <Building className="h-4 w-4 mr-2" />
          Empresas
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            confirmDeleteCourse(course);
          }} 
          className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Definir colunas da tabela
  const columns: AdminTableColumn<Course>[] = [
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
      sortable: true,
      sortField: 'title',
    },
    {
      id: 'instructor',
      header: 'Instrutor',
      cell: (course) => (
        <span className="text-gray-600 dark:text-gray-300">
          {course.instructor || 'Não especificado'}
        </span>
      ),
      sortable: true,
      sortField: 'instructor',
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
            : 'Sem descrição'}
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Carregando cursos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <AdminFilterBar
          filters={filterConfigs}
          companyColor={companyColor}
          showClearButton={true}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Tabela */}
      <AdminTable
        data={paginatedCourses}
        columns={columns}
        loading={isLoading}
        getRowKey={(course) => course.id}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyState={{
          icon: BookOpen,
          title: hasActiveFilters ? 'Nenhum curso encontrado' : 'Nenhum curso encontrado',
          description: hasActiveFilters 
            ? 'Tente ajustar os filtros para encontrar cursos'
            : companyId
              ? 'Não há cursos vinculados a esta empresa. Clique em "Novo Curso" para criar um curso e vinculá-lo automaticamente à empresa selecionada, ou edite um curso existente e vincule-o através da opção "Empresas" no menu de ações.'
              : 'Selecione uma empresa no menu superior e clique em "Novo Curso" para começar',
        }}
        onRowClick={(course) => handleCourseClick(course.id)}
      />

      {/* Paginação */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        companyColor={companyColor}
      />

      {/* Formulário de curso */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedCourse ? "Editar Curso" : "Novo Curso"}</SheetTitle>
          </SheetHeader>
          <CourseForm 
            initialData={selectedCourse} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)} 
            isSubmitting={isSubmitting} 
            onClose={() => setIsFormOpen(false)} 
            preselectedCompanyId={companyId} 
          />
        </SheetContent>
      </Sheet>

      {/* Diálogo para gerenciar empresas */}
      <Dialog open={isCompanyManagerOpen} onOpenChange={setIsCompanyManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Empresas</DialogTitle>
          </DialogHeader>
          
          {selectedCourse && (
            <CompanyCoursesManager 
              course={selectedCourse} 
              onClose={() => setIsCompanyManagerOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Gerenciador de aulas */}
      {selectedCourse && (
        <LessonManager 
          courseId={selectedCourse.id} 
          courseTitle={selectedCourse.title} 
          onClose={() => setIsLessonManagerOpen(false)} 
          open={isLessonManagerOpen} 
        />
      )}

      {/* Diálogo de confirmação para excluir curso */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.
              {courseToDelete && (
                <div className="mt-2 font-semibold text-foreground">
                  "{courseToDelete.title}"
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCourse} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
