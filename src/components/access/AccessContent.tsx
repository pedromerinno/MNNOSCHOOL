
import React, { useState, useEffect } from 'react';
import { AccessList } from "./AccessList";
import { AccessDetails } from "./AccessDetails";
import { EditAccessDialog } from "./EditAccessDialog";
import { AccessItem } from "./types";

interface AccessContentProps {
  items: AccessItem[];
  companyColor?: string;
  onAccessUpdated?: () => void;
}

export const AccessContent = ({ items, companyColor, onAccessUpdated }: AccessContentProps) => {
  const [selectedAccess, setSelectedAccess] = useState<AccessItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Debug: Log items when they change
  useEffect(() => {
    console.log('AccessContent recebeu items:', items?.length, 'itens:', items);
  }, [items]);

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
      <div className="text-center py-8">
        <p className="text-gray-500">
          Nenhum acesso compartilhado foi cadastrado pela empresa ainda.
        </p>
      </div>
    );
  }

  return (
    <>
      <AccessList 
        items={items}
        onSelectAccess={openAccessDetails}
        onEdit={handleEdit}
        onAccessUpdated={handleAccessUpdated}
        companyColor={companyColor}
      />

      <AccessDetails 
        access={selectedAccess}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        companyColor={companyColor}
      />

      <EditAccessDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        accessItem={editingAccess}
        onAccessUpdated={handleAccessUpdated}
      />
    </>
  );
};
