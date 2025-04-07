
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
import { Pencil, Trash2, Building } from "lucide-react";
import { Course } from './CourseManagement';

interface CourseTableProps {
  courses: Course[];
  loading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onManageCompanies: (course: Course) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({ 
  courses, 
  loading, 
  onEdit,
  onDelete,
  onManageCompanies
}) => {
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
          {courses.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Nenhum curso encontrado
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.description || '-'}</TableCell>
                <TableCell>{course.instructor || '-'}</TableCell>
                <TableCell>{new Date(course.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right space-x-2">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
