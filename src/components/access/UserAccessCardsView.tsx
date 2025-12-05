import React from 'react';
import { PasswordCard, PasswordItem } from './PasswordCard';

interface UserAccessCardsViewProps {
  items: PasswordItem[];
  companyColor?: string;
  onEdit?: (item: PasswordItem) => void;
  onDelete?: (item: PasswordItem) => void;
}

export const UserAccessCardsView: React.FC<UserAccessCardsViewProps> = ({
  items,
  companyColor,
  onEdit,
  onDelete
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <PasswordCard
          key={item.id}
          item={item}
          companyColor={companyColor}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={true}
        />
      ))}
    </div>
  );
};





