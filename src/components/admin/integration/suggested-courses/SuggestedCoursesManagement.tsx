
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { SuggestCourseToUserDialog } from './SuggestCourseToUserDialog';
import { SuggestionActionsDropdown } from './SuggestionActionsDropdown';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    image_url?: string;
  };
  user: {
    display_name: string;
    email: string;
    avatar?: string;
  };
  suggested_by_profile: {
    display_name: string;
  };
  company: {
    nome: string;
  };
}

interface CompanyUser {
  id: string;
  display_name: string;
  email: string;
}

export const SuggestedCoursesManagement: React.FC = () => {
  const { selectedCompany } = useCompanies();
  const [suggestions, setSuggestions] = useState<SuggestedCourse[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestedCourse[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<SuggestedCourse | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<SuggestedCourse | null>(null);

  const fetchCompanyUsers = async () => {
    if (!selectedCompany?.id) return;

    try {
      const { data: users, error } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          profiles!inner(id, display_name, email)
        `)
        .eq('empresa_id', selectedCompany.id);

      if (error) {
        console.error('Error fetching company users:', error);
        return;
      }

      const formattedUsers = users?.map(u => ({
        id: u.profiles.id,
        display_name: u.profiles.display_name || 'Usuário sem nome',
        email: u.profiles.email || ''
      })) || [];

      setCompanyUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching company users:', error);
    }
  };

  const fetchSuggestions = async () => {
    if (!selectedCompany?.id) {
      setSuggestions([]);
      setFilteredSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch suggestions filtered by selected company
      const { data: suggestionsData, error } = await supabase
        .from('user_course_suggestions')
        .select('*')
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggestions:', error);
        toast.error('Erro ao carregar sugestões de cursos');
        return;
      }

      if (!suggestionsData || suggestionsData.length === 0) {
        setSuggestions([]);
        setFilteredSuggestions([]);
        return;
      }

      // Get unique IDs for batch fetching
      const courseIds = [...new Set(suggestionsData.map(s => s.course_id))];
      const userIds = [...new Set(suggestionsData.map(s => s.user_id))];
      const suggestedByIds = [...new Set(suggestionsData.map(s => s.suggested_by))];

      // Fetch all related data in parallel
      const [coursesResponse, usersResponse, suggestedByResponse] = await Promise.all([
        supabase.from('courses').select('id, title, instructor, image_url').in('id', courseIds),
        supabase.from('profiles').select('id, display_name, email, avatar').in('id', userIds),
        supabase.from('profiles').select('id, display_name').in('id', suggestedByIds)
      ]);

      // Check for errors
      if (coursesResponse.error || usersResponse.error || suggestedByResponse.error) {
        console.error('Error fetching related data:', {
          courses: coursesResponse.error,
          users: usersResponse.error,
          suggestedBy: suggestedByResponse.error
        });
        toast.error('Erro ao carregar dados relacionados');
        return;
      }

      // Create lookup maps
      const coursesMap = new Map(coursesResponse.data?.map(c => [c.id, c]) || []);
      const usersMap = new Map(usersResponse.data?.map(u => [u.id, u]) || []);
      const suggestedByMap = new Map(suggestedByResponse.data?.map(u => [u.id, u]) || []);

      // Combine the data
      const enrichedSuggestions = suggestionsData.map(suggestion => ({
        ...suggestion,
        course: coursesMap.get(suggestion.course_id) || { title: 'Curso não encontrado' },
        user: usersMap.get(suggestion.user_id) || { display_name: 'Usuário não encontrado', email: '' },
        suggested_by_profile: suggestedByMap.get(suggestion.suggested_by) || { display_name: 'Usuário não encontrado' },
        company: { nome: selectedCompany.nome }
      }));

      setSuggestions(enrichedSuggestions);
      setFilteredSuggestions(enrichedSuggestions);
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

  const handleUserFilter = (userId: string) => {
    setSelectedUserId(userId);
    if (userId === 'all') {
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions(suggestions.filter(s => s.user_id === userId));
    }
  };

  const handleEditSuggestion = (suggestion: SuggestedCourse) => {
    setEditingSuggestion(suggestion);
    setIsSuggestDialogOpen(true);
  };

  const handleSuggestionCreated = () => {
    fetchSuggestions();
    setEditingSuggestion(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsSuggestDialogOpen(open);
    if (!open) {
      setEditingSuggestion(null);
    }
  };

  useEffect(() => {
    if (selectedCompany?.id) {
      fetchSuggestions();
      fetchCompanyUsers();
    }
  }, [selectedCompany?.id]);

  useEffect(() => {
    handleUserFilter(selectedUserId);
  }, [suggestions]);

  if (!selectedCompany) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhuma empresa selecionada
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Selecione uma empresa para gerenciar suas sugestões de cursos.
          </p>
        </div>
      </div>
    );
  }

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
            Gerencie sugestões de cursos para {selectedCompany.nome}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsSuggestDialogOpen(true)}
          className="bg-black hover:bg-gray-800 text-white rounded-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Filtrar por usuário:
              </label>
              <Select value={selectedUserId} onValueChange={handleUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {companyUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.display_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-500 mt-6">
              Exibindo {filteredSuggestions.length} de {suggestions.length} sugestões
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sugestões de Cursos ({filteredSuggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {selectedUserId === 'all' ? 'Nenhuma sugestão encontrada' : 'Nenhuma sugestão para este usuário'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {selectedUserId === 'all' 
                  ? 'Ainda não há sugestões de cursos para esta empresa. Comece criando uma nova sugestão.'
                  : 'Não há sugestões de cursos para o usuário selecionado.'
                }
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
                  <TableHead>Sugerido por</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {suggestion.course?.image_url ? (
                            <img 
                              src={suggestion.course.image_url} 
                              alt={suggestion.course?.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{suggestion.course?.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={suggestion.user?.avatar} alt={suggestion.user?.display_name} />
                          <AvatarFallback>
                            {suggestion.user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{suggestion.user?.display_name}</div>
                          <div className="text-sm text-gray-500">{suggestion.user?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{suggestion.suggested_by_profile?.display_name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {suggestion.reason}
                    </TableCell>
                    <TableCell>
                      {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <SuggestionActionsDropdown
                        suggestion={suggestion}
                        onEdit={handleEditSuggestion}
                        onDelete={confirmDeleteSuggestion}
                      />
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
        onOpenChange={handleDialogClose}
        onSuggestionCreated={handleSuggestionCreated}
        editingSuggestion={editingSuggestion}
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
