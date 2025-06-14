
import React, { useState } from 'react';
import { AccessList } from "./AccessList";
import { AccessDetails } from "./AccessDetails";
import { AccessItem } from "./types";

interface AccessContentProps {
  items: AccessItem[];
  companyColor?: string;
}

export const AccessContent = ({ items, companyColor }: AccessContentProps) => {
  const [selectedAccess, setSelectedAccess] = useState<AccessItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openAccessDetails = (access: AccessItem) => {
    setSelectedAccess(access);
    setIsDialogOpen(true);
  };

  if (items.length === 0) {
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
        companyColor={companyColor}
      />

      <AccessDetails 
        access={selectedAccess}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        companyColor={companyColor}
      />
    </>
  );
};
