import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, BookOpenCheck, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { AdminPageTitle } from '../../AdminPageTitle';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { SuggestCourseToUserDialog } from './SuggestCourseToUserDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminFilterBar, FilterConfig } from '../../AdminFilterBar';
import { AdminTable, AdminTableColumn, SortField, SortDirection } from '../../AdminTable';
import { AdminPagination } from '../../AdminPagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SuggestedCourse {
  id: string;
  course_id: string;
  user_id: string;
  suggested_by: string;
  reason: string;
  created_at: string;
  company_id: string;
  order_index?: number;
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
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  const [suggestions, setSuggestions] = useState<SuggestedCourse[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<SuggestedCourse | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<SuggestedCourse | null>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Ordenação
  const [sortField, setSortField] = useState<SortField | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchCompanyUsers = async () => {
    if (!selectedCompany?.id) return;

    try {
      // Usar função RPC otimizada get_company_users em vez de query separada
      // Muito mais rápido que fazer JOIN manual entre user_empresa e profiles
      const { data: usersData, error } = await supabase
        .rpc('get_company_users', { _empresa_id: selectedCompany.id });

      if (error) {
        console.error('Error fetching company users:', error);
        return;
      }

      const formattedUsers = usersData?.map((u: any) => ({
        id: u.id,
        display_name: u.display_name || 'Usuário sem nome',
        email: u.email || ''
      })) || [];

      setCompanyUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching company users:', error);
    }
  };

  const fetchSuggestions = async () => {
    if (!selectedCompany?.id) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch suggestions filtered by selected company with order_index
      const { data: suggestionsData, error } = await supabase
        .from('user_course_suggestions')
        .select('*')
        .eq('company_id', selectedCompany.id)
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggestions:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Erro ao carregar sugestões de cursos: ${error.message || 'Erro desconhecido'}`);
        setIsLoading(false);
        return;
      }

      if (!suggestionsData || suggestionsData.length === 0) {
        setSuggestions([]);
        setIsLoading(false);
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
        const errorMessages = [
          coursesResponse.error?.message,
          usersResponse.error?.message,
          suggestedByResponse.error?.message
        ].filter(Boolean).join(', ');
        toast.error(`Erro ao carregar dados relacionados: ${errorMessages || 'Erro desconhecido'}`);
        setIsLoading(false);
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
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      toast.error(`Erro ao carregar sugestões de cursos: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    // Create a new array with reordered items (usando filteredSuggestions)
    const newSuggestions = Array.from(filteredSuggestions);
    const [reorderedItem] = newSuggestions.splice(startIndex, 1);
    newSuggestions.splice(endIndex, 0, reorderedItem);

    try {
      // Update order_index for all affected items
      const updates = newSuggestions.map((suggestion, index) => ({
        id: suggestion.id,
        order_index: index
      }));

      // Batch update the order_index in the database
      for (const update of updates) {
        const { error } = await supabase
          .from('user_course_suggestions')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) {
          console.error('Error updating order:', error);
          fetchSuggestions();
          toast.error('Erro ao reordenar sugestões');
          return;
        }
      }

      toast.success('Ordem das sugestões atualizada com sucesso');
      fetchSuggestions(); // Recarregar para atualizar estado

    } catch (error) {
      console.error('Error reordering suggestions:', error);
      toast.error('Erro ao reordenar sugestões');
      fetchSuggestions();
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

  // Filtrar e ordenar sugestões
  const filteredSuggestions = useMemo(() => {
    let filtered = suggestions.filter(suggestion => {
      // Filtro por usuário
      const matchesUser = selectedUserId === 'all' || suggestion.user_id === selectedUserId;
      
      // Filtro por busca (curso, usuário, motivo)
      const matchesSearch = searchTerm === '' || 
        suggestion.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesUser && matchesSearch;
    });

    // Aplicar ordenação
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'course':
            aValue = a.course?.title?.toLowerCase() || '';
            bValue = b.course?.title?.toLowerCase() || '';
            break;
          case 'user':
            aValue = a.user?.display_name?.toLowerCase() || '';
            bValue = b.user?.display_name?.toLowerCase() || '';
            break;
          case 'suggested_by':
            aValue = a.suggested_by_profile?.display_name?.toLowerCase() || '';
            bValue = b.suggested_by_profile?.display_name?.toLowerCase() || '';
            break;
          case 'reason':
            aValue = a.reason?.toLowerCase() || '';
            bValue = b.reason?.toLowerCase() || '';
            break;
          case 'date':
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
    }

    return filtered;
  }, [suggestions, selectedUserId, searchTerm, sortField, sortDirection]);

  // Paginar sugestões
  const paginatedSuggestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSuggestions.slice(startIndex, endIndex);
  }, [filteredSuggestions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedUserId]);

  const handleUserFilter = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedUserId('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || selectedUserId !== 'all';

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

  const handleSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Resetar para primeira página ao ordenar
  }, []);

  useEffect(() => {
    if (selectedCompany?.id) {
      fetchSuggestions();
      fetchCompanyUsers();
    }
  }, [selectedCompany?.id]);

  // Configurar filtros para o AdminFilterBar
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: 'text',
      id: 'search',
      placeholder: 'Buscar por curso, usuário ou motivo...',
      value: searchTerm,
      onChange: setSearchTerm,
    },
    {
      type: 'select',
      id: 'user',
      placeholder: 'Usuário',
      value: selectedUserId,
      onChange: handleUserFilter,
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Todos os usuários' },
        ...companyUsers.map(user => ({
          value: user.id,
          label: `${user.display_name} (${user.email})`,
        })),
      ],
    },
  ], [searchTerm, selectedUserId, companyUsers, handleUserFilter]);

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
      <AdminPageTitle
        title="Sugestões de Cursos"
        description={`Gerencie sugestões de cursos para ${selectedCompany.nome}`}
        size="xl"
        actions={
          <Button 
            onClick={() => setIsSuggestDialogOpen(true)}
            className="bg-black hover:bg-gray-800 text-white rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Sugestão
          </Button>
        }
      />

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <AdminFilterBar
          filters={filterConfigs}
          companyColor={companyColor}
          showClearButton={true}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
          resultsCount={{
            current: paginatedSuggestions.length,
            total: filteredSuggestions.length,
            label: 'Mostrando',
            showTotalWhenFiltered: true,
            totalCount: suggestions.length,
          }}
        />
      </div>

      {/* Tabela */}
      {(() => {
        // Renderizar curso
        const renderCourse = (suggestion: SuggestedCourse) => (
          <div className="flex items-center gap-4 min-w-[280px]">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              {suggestion.course?.image_url ? (
                <img 
                  src={suggestion.course.image_url} 
                  alt={suggestion.course?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight mb-1">
                {suggestion.course?.title || 'Curso não encontrado'}
              </div>
              {suggestion.course?.instructor && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {suggestion.course.instructor}
                </div>
              )}
            </div>
          </div>
        );

        // Renderizar usuário
        const renderUser = (suggestion: SuggestedCourse) => (
          <div className="flex items-center gap-3 min-w-[220px]">
            <Avatar className="h-10 w-10">
              <AvatarImage src={suggestion.user?.avatar} alt={suggestion.user?.display_name} />
              <AvatarFallback className="text-sm">
                {suggestion.user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1">
                {suggestion.user?.display_name || 'Usuário não encontrado'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {suggestion.user?.email}
              </div>
            </div>
          </div>
        );

        // Renderizar ações
        const renderActions = (suggestion: SuggestedCourse) => (
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
                handleEditSuggestion(suggestion);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeleteSuggestion(suggestion);
                }}
                className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );

        // Definir colunas
        const columns: AdminTableColumn<SuggestedCourse>[] = [
          {
            id: 'course',
            header: 'Curso',
            cell: (suggestion) => renderCourse(suggestion),
            sortable: true,
            sortField: 'course',
            className: 'min-w-[280px]',
          },
          {
            id: 'user',
            header: 'Usuário',
            cell: (suggestion) => renderUser(suggestion),
            sortable: true,
            sortField: 'user',
            className: 'min-w-[220px]',
          },
          {
            id: 'suggested_by',
            header: 'Sugerido por',
            cell: (suggestion) => (
              <div className="min-w-[150px]">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {suggestion.suggested_by_profile?.display_name || '-'}
                </span>
              </div>
            ),
            responsive: { hideBelow: 'md' },
            sortable: true,
            sortField: 'suggested_by',
            className: 'min-w-[150px]',
          },
          {
            id: 'reason',
            header: 'Motivo',
            cell: (suggestion) => {
              const reason = suggestion.reason || '-';
              const isTruncated = suggestion.reason && suggestion.reason.length > 80;
              
              if (!isTruncated) {
                return (
                  <div className="min-w-[250px] max-w-[400px]">
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {reason}
                    </span>
                  </div>
                );
              }
              
              return (
                <div className="min-w-[250px] max-w-[400px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-gray-700 dark:text-gray-300 truncate block cursor-help leading-relaxed">
                          {`${suggestion.reason.substring(0, 80)}...`}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-lg">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{suggestion.reason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            },
            responsive: { hideBelow: 'lg' },
            sortable: true,
            sortField: 'reason',
            className: 'min-w-[250px]',
          },
          {
            id: 'date',
            header: 'Data',
            cell: (suggestion) => {
              const date = new Date(suggestion.created_at);
              const dateStr = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const timeStr = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              
              return (
                <div className="min-w-[120px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-gray-700 dark:text-gray-300 cursor-help font-medium">
                          {dateStr}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{dateStr} às {timeStr}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            },
            responsive: { hideBelow: 'md' },
            sortable: true,
            sortField: 'date',
            className: 'min-w-[120px]',
          },
          {
            id: 'actions',
            header: 'Ações',
            cell: (suggestion) => renderActions(suggestion),
            align: 'right',
            className: 'w-16',
          },
        ];

        return (
          <div className="overflow-x-auto">
            <AdminTable
              data={paginatedSuggestions}
              columns={columns}
              loading={isLoading}
              getRowKey={(suggestion) => suggestion.id}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              className="min-w-full"
              rowClassName="h-auto"
              cellPadding="px-6 py-5"
              emptyState={{
                icon: BookOpen,
                title: hasActiveFilters ? 'Nenhuma sugestão encontrada' : 'Nenhuma sugestão encontrada',
                description: hasActiveFilters 
                  ? 'Tente ajustar os filtros para encontrar sugestões'
                  : 'Ainda não há sugestões de cursos para esta empresa. Comece criando uma nova sugestão.',
              }}
            />
          </div>
        );
      })()}

      {/* Paginação */}
      {totalPages > 1 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          companyColor={companyColor}
        />
      )}

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
