
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
import { Pencil, Trash2, Building, FileText } from "lucide-react";
import { Course } from './CourseManagement';
import { Skeleton } from "@/components/ui/skeleton";

interface CourseTableProps {
  courses: Course[];
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
  if (loading) {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Instrutor</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Instrutor</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Nenhum curso encontrado
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>
                  {course.description 
                    ? course.description.length > 80 
                      ? `${course.description.substring(0, 80)}...` 
                      : course.description 
                    : '-'
                  }
                </TableCell>
                <TableCell>{course.instructor || '-'}</TableCell>
                <TableCell>{new Date(course.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {onViewLessons && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewLessons(course)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Aulas
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onManageCompanies(course)}
                    >
                      <Building className="h-4 w-4 mr-1" />
                      Empresas
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(course)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
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
