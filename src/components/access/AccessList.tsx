
import React from 'react';
import { AccessCard } from './AccessCard';
import { AccessItem } from './types';

interface AccessListProps {
  items: AccessItem[];
  onSelectAccess: (access: AccessItem) => void;
  onEdit?: (access: AccessItem) => void;
  onAccessUpdated?: () => void;
  companyColor?: string;
}

export const AccessList = ({ items, onSelectAccess, onEdit, onAccessUpdated, companyColor }: AccessListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((item) => (
        <AccessCard 
          key={item.id}
          item={item}
          onClick={() => onSelectAccess(item)}
          onEdit={onEdit}
          onAccessUpdated={onAccessUpdated}
          companyColor={companyColor}
        />
      ))}
    </div>
  );
};
