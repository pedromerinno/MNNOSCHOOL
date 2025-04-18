
import React from 'react';
import { AccessCard } from './AccessCard';
import { AccessItem } from './types';

interface AccessListProps {
  items: AccessItem[];
  onSelectAccess: (access: AccessItem) => void;
  companyColor?: string;
}

export const AccessList = ({ items, onSelectAccess, companyColor }: AccessListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <AccessCard 
          key={item.id}
          item={item}
          onClick={() => onSelectAccess(item)}
          companyColor={companyColor}
        />
      ))}
    </div>
  );
};
