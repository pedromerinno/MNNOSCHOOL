
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";
import { EditNoticeDialog } from "./dialogs/EditNoticeDialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  User, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { AdminPageTitle } from './AdminPageTitle';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Notice } from "@/hooks/useNotifications";
import { MetricCard } from './MetricCard';
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";

type SortOption = 'date-desc' | 'date-asc' | 'type' | 'title';
type FilterType = 'all' | 'informativo' | 'urgente' | 'padrão';
type VisibilityFilter = 'all' | 'visible' | 'hidden';

export const CompanyNoticesAdminList: React.FC = () => {
  const { selectedCompany } = useCompanies();
  const { notices, isLoading, fetchNotices, deleteNotice } = useCompanyNotices();
  const [isNewNoticeDialogOpen, setIsNewNoticeDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [localNotices, setLocalNotices] = useState<Notice[]>([]);
  
  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync local notices with fetched notices
  useEffect(() => {
    setLocalNotices(notices);
  }, [notices]);

  // Auto-refresh when component mounts
  useEffect(() => {
    if (selectedCompany) {
      fetchNotices();
    }
  }, [selectedCompany, fetchNotices]);

  const updateLocalNotice = (noticeId: string, updates: Partial<Notice>) => {
    setLocalNotices(prev => 
      prev.map(notice => 
        notice.id === noticeId 
          ? { ...notice, ...updates }
          : notice
      )
    );
  };

  const handleToggleVisibility = async (noticeId: string, currentVisibility: boolean) => {
    try {
      // Update local state immediately for instant feedback
      updateLocalNotice(noticeId, { visibilidade: !currentVisibility } as any);

      const { error } = await supabase
        .from('company_notices')
        .update({ visibilidade: !currentVisibility })
        .eq('id', noticeId);

      if (error) throw error;

      toast.success(`Aviso ${!currentVisibility ? 'publicado' : 'ocultado'} com sucesso`);
      
      // Refresh to ensure consistency
      await fetchNotices();
    } catch (error) {
      console.error('Error toggling notice visibility:', error);
      toast.error('Erro ao alterar visibilidade do aviso');
      
      // Revert local state on error
      updateLocalNotice(noticeId, { visibilidade: currentVisibility } as any);
    }
  };

  const handleDeleteClick = (noticeId: string, noticeTitle: string) => {
    setNoticeToDelete({ id: noticeId, title: noticeTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noticeToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteNotice(noticeToDelete.id);
      if (success) {
        toast.success('Aviso excluído com sucesso');
        await fetchNotices();
        setDeleteDialogOpen(false);
        setNoticeToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Erro ao excluir aviso');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar e ordenar avisos
  const filteredAndSortedNotices = useMemo(() => {
    let filtered = [...localNotices];

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notice => 
        notice.title.toLowerCase().includes(query) ||
        notice.content.toLowerCase().includes(query)
      );
    }

    // Aplicar filtro de tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notice => notice.type === typeFilter);
    }

    // Aplicar filtro de visibilidade
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(notice => {
        const isVisible = (notice as any).visibilidade !== false;
        return visibilityFilter === 'visible' ? isVisible : !isVisible;
      });
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [localNotices, searchQuery, typeFilter, visibilityFilter, sortBy]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = localNotices.length;
    const visible = localNotices.filter(n => (n as any).visibilidade !== false).length;
    const hidden = total - visible;
    const urgent = localNotices.filter(n => n.type === 'urgente').length;
    
    return { total, visible, hidden, urgent };
  }, [localNotices]);

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsEditDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsNewNoticeDialogOpen(open);
    if (!open && selectedCompany) {
      fetchNotices();
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedNotice(null);
      if (selectedCompany) {
        fetchNotices();
      }
    }
  };

  if (!selectedCompany) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">Nenhuma empresa selecionada</h3>
        <p className="text-gray-500">Selecione uma empresa para visualizar os avisos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Avisos"
        description="Gerenciar avisos da empresa"
        size="xl"
        actions={
          <Button 
            onClick={() => setIsNewNoticeDialogOpen(true)}
            className="bg-black hover:bg-gray-800 text-white rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Aviso
          </Button>
        }
      />

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        <MetricCard
          title="Total de Avisos"
          value={stats.total}
          color={selectedCompany?.cor_principal || '#1EAEDB'}
          loading={isLoading}
          description="Avisos cadastrados"
        />
        <MetricCard
          title="Avisos Visíveis"
          value={stats.visible}
          color={selectedCompany?.cor_principal || '#1EAEDB'}
          loading={isLoading}
          description="Publicados e visíveis"
        />
        <MetricCard
          title="Avisos Ocultos"
          value={stats.hidden}
          color={selectedCompany?.cor_principal || '#1EAEDB'}
          loading={isLoading}
          description="Ocultos dos usuários"
        />
        <MetricCard
          title="Avisos Urgentes"
          value={stats.urgent}
          color={selectedCompany?.cor_principal || '#1EAEDB'}
          loading={isLoading}
          description="Marcados como urgentes"
        />
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar avisos por título ou conteúdo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Tipo */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as FilterType)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="informativo">Informativo</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="padrão">Padrão</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Visibilidade */}
            <Select value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value as VisibilityFilter)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Eye className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="visible">Visíveis</SelectItem>
                <SelectItem value="hidden">Ocultos</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Mais recentes</SelectItem>
                <SelectItem value="date-asc">Mais antigos</SelectItem>
                <SelectItem value="type">Por tipo</SelectItem>
                <SelectItem value="title">Por título</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Carregando avisos...</p>
          </CardContent>
        </Card>
      ) : localNotices.length === 0 ? (
        <div className="flex justify-center py-12">
          <EmptyState
            title="Nenhum aviso encontrado"
            description={`Crie o primeiro aviso para ${selectedCompany.nome}`}
            icons={[Bell]}
            action={{
              label: "Criar Primeiro Aviso",
              onClick: () => setIsNewNoticeDialogOpen(true)
            }}
          />
        </div>
      ) : filteredAndSortedNotices.length === 0 ? (
        <div className="flex justify-center py-12">
          <EmptyState
            title="Nenhum aviso encontrado"
            description="Tente ajustar os filtros ou a busca para encontrar avisos."
            icons={[Search]}
            action={{
              label: "Limpar Filtros",
              onClick: () => {
                setSearchQuery('');
                setTypeFilter('all');
                setVisibilityFilter('all');
              }
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Mostrando {filteredAndSortedNotices.length} de {localNotices.length} avisos</span>
          </div>
          <div className="grid gap-4">
            {filteredAndSortedNotices.map((notice) => (
              <Card 
                key={notice.id} 
                className={`relative border transition-all hover:shadow-md ${
                  notice.type === 'urgente' 
                    ? 'border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/10' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge 
                          variant={notice.type === 'urgente' ? 'destructive' : 'outline'}
                          className={`text-xs capitalize ${
                            notice.type === 'urgente' 
                              ? 'bg-red-500 text-white' 
                              : notice.type === 'informativo'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          {notice.type}
                        </Badge>
                        <Badge 
                          variant={(notice as any).visibilidade ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {(notice as any).visibilidade ? (
                            <>
                              <Eye className="mr-1 h-3 w-3" />
                              Visível
                            </>
                          ) : (
                            <>
                              <EyeOff className="mr-1 h-3 w-3" />
                              Oculto
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-3 font-semibold line-clamp-2">{notice.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(notice.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{notice.author?.display_name || 'Usuário'}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleVisibility(notice.id, (notice as any).visibilidade)}>
                          {(notice as any).visibilidade ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Mostrar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditNotice(notice)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar Aviso
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(notice.id, notice.title)}
                          className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir Aviso
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{notice.content}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {selectedCompany.logo && (
                        <img 
                          src={selectedCompany.logo} 
                          alt={selectedCompany.nome}
                          className="w-5 h-5 rounded object-cover"
                        />
                      )}
                      <Badge 
                        className="text-xs font-medium px-3 py-1"
                        style={{
                          backgroundColor: `${selectedCompany.cor_principal}20`,
                          color: selectedCompany.cor_principal,
                          borderColor: `${selectedCompany.cor_principal}30`
                        }}
                      >
                        {selectedCompany.nome}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <NewNoticeDialog
        open={isNewNoticeDialogOpen}
        onOpenChange={handleDialogOpenChange}
      />

      <EditNoticeDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        notice={selectedNotice}
        companyId={selectedCompany.id}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="py-4">
              <div className="flex flex-col gap-3">
                <p>
                  Tem certeza que deseja excluir o aviso <span className="font-medium text-foreground">"{noticeToDelete?.title}"</span>?
                </p>
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <span>Esta ação não pode ser desfeita.</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Excluir aviso
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
