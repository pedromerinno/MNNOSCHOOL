
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SuggestCourseToUserDialog } from './SuggestCourseToUserDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SuggestedCourse {
  id: string;
  course_id: string;
  user_id: string;
  suggested_by: string;
  reason: string;
  created_at: string;
  company_id: string;
  course: {
    title: string;
    instructor?: string;
  };
  user: {
    display_name: string;
    email: string;
  };
  suggested_by_profile: {
    display_name: string;
  };
  company: {
    nome: string;
  };
}

export const SuggestedCoursesManagement: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<SuggestedCourse | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_course_suggestions')
        .select(`
          *,
          course:courses(title, instructor),
          user:profiles!user_course_suggestions_user_id_fkey(display_name, email),
          suggested_by_profile:profiles!user_course_suggestions_suggested_by_fkey(display_name),
          company:empresas(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggestions:', error);
        toast.error('Erro ao carregar sugestões de cursos');
        return;
      }

      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Erro ao carregar sugestões de cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!suggestionToDelete) return;

    try {
      const { error } = await supabase
        .from('user_course_suggestions')
        .delete()
        .eq('id', suggestionToDelete.id);

      if (error) {
        console.error('Error deleting suggestion:', error);
        toast.error('Erro ao remover sugestão');
        return;
      }

      toast.success('Sugestão removida com sucesso');
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      toast.error('Erro ao remover sugestão');
    } finally {
      setDeleteDialogOpen(false);
      setSuggestionToDelete(null);
    }
  };

  const confirmDeleteSuggestion = (suggestion: SuggestedCourse) => {
    setSuggestionToDelete(suggestion);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Sugestões de Cursos</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie todas as sugestões de cursos para usuários
          </p>
        </div>
        
        <Button 
          onClick={() => setIsSuggestDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sugestões de Cursos ({suggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma sugestão encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Ainda não há sugestões de cursos. Comece criando uma nova sugestão.
              </p>
              <Button onClick={() => setIsSuggestDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Sugestão
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Sugerido por</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{suggestion.course?.title}</div>
                        {suggestion.course?.instructor && (
                          <div className="text-sm text-gray-500">
                            {suggestion.course.instructor}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{suggestion.user?.display_name}</div>
                        <div className="text-sm text-gray-500">{suggestion.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{suggestion.company?.nome}</Badge>
                    </TableCell>
                    <TableCell>{suggestion.suggested_by_profile?.display_name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {suggestion.reason}
                    </TableCell>
                    <TableCell>
                      {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDeleteSuggestion(suggestion)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SuggestCourseToUserDialog
        open={isSuggestDialogOpen}
        onOpenChange={setIsSuggestDialogOpen}
        onSuggestionCreated={fetchSuggestions}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Sugestão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta sugestão de curso? Esta ação não pode ser desfeita.
              {suggestionToDelete && (
                <div className="mt-2 font-semibold text-foreground">
                  Curso: {suggestionToDelete.course?.title} para {suggestionToDelete.user?.display_name}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSuggestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
