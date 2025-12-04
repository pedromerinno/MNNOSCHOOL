
import React, { useState, useEffect, useMemo } from 'react';
import { AccessList } from "./AccessList";
import { AccessTableView } from "./AccessTableView";
import { AccessDetails } from "./AccessDetails";
import { EditAccessDialog } from "./EditAccessDialog";
import { CreateAccessDialog } from "./CreateAccessDialog";
import { EmptyState } from "./EmptyState";
import { AccessItem } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";

type ViewMode = 'card' | 'table';

interface AccessContentProps {
  items: AccessItem[];
  companyColor?: string;
  onAccessUpdated?: () => void;
  viewMode?: ViewMode;
}

export const AccessContent = ({ items, companyColor, onAccessUpdated, viewMode = 'card' }: AccessContentProps) => {
  const [selectedAccess, setSelectedAccess] = useState<AccessItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useIsAdmin();

  // Debug: Log items when they change
  useEffect(() => {
    console.log('AccessContent recebeu items:', items?.length, 'itens:', items);
  }, [items]);

  // Filtrar itens baseado no termo de busca
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const term = searchTerm.toLowerCase().trim();
    return items.filter(item => 
      item.tool_name.toLowerCase().includes(term) ||
      item.username.toLowerCase().includes(term) ||
      (item.url && item.url.toLowerCase().includes(term)) ||
      (item.notes && item.notes.toLowerCase().includes(term))
    );
  }, [items, searchTerm]);

  const openAccessDetails = (access: AccessItem) => {
    setSelectedAccess(access);
    setIsDialogOpen(true);
  };

  const handleEdit = (access: AccessItem) => {
    setEditingAccess(access);
    setIsEditDialogOpen(true);
  };

  const handleAccessUpdated = () => {
    if (onAccessUpdated) {
      onAccessUpdated();
    }
  };

  if (!items || items.length === 0) {
    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Senhas Compartilhadas
            </h3>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar Senha
            </Button>
          )}
        </div>
        <div className="py-8">
          <EmptyState 
            title="Nenhum acesso compartilhado"
            description="Nenhum acesso compartilhado foi cadastrado pela empresa ainda."
          />
        </div>
        <CreateAccessDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onAccessUpdated={handleAccessUpdated}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Senhas Compartilhadas
            </h3>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar Senha
            </Button>
          )}
        </div>
        
        {/* Filtros de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por ferramenta, URL, usuário ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-8">
          <EmptyState 
            title="Nenhum resultado encontrado"
            description={searchTerm ? `Não foram encontradas senhas que correspondam a "${searchTerm}".` : "Nenhum acesso compartilhado foi cadastrado pela empresa ainda."}
          />
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <AccessList 
              items={filteredItems}
              onSelectAccess={openAccessDetails}
              onEdit={handleEdit}
              onAccessUpdated={handleAccessUpdated}
              companyColor={companyColor}
            />
          ) : (
            <AccessTableView
              items={filteredItems}
              onSelectAccess={openAccessDetails}
              onEdit={handleEdit}
              onAccessUpdated={handleAccessUpdated}
              companyColor={companyColor}
            />
          )}
        </>
      )}

      <AccessDetails 
        access={selectedAccess}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        companyColor={companyColor}
        onAccessUpdated={handleAccessUpdated}
      />

      <EditAccessDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        accessItem={editingAccess}
        onAccessUpdated={handleAccessUpdated}
      />

      <CreateAccessDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onAccessUpdated={handleAccessUpdated}
      />
    </>
  );
};
