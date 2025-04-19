
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

  return (
    <>
      <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
        <AccessList 
          items={items}
          onSelectAccess={openAccessDetails}
          companyColor={companyColor}
        />
      </div>

      <AccessDetails 
        access={selectedAccess}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        companyColor={companyColor}
      />
    </>
  );
};
