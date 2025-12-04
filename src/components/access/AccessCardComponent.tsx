import React from 'react';
import { AccessItem } from './types';
import { PasswordCard, PasswordItem } from './PasswordCard';

interface AccessCardComponentProps {
  item: AccessItem;
  onClick: () => void;
  companyColor?: string;
  onEdit?: (item: AccessItem) => void;
  onDelete?: (item: AccessItem) => void;
  canEdit?: boolean;
}

export const AccessCardComponent: React.FC<AccessCardComponentProps> = ({
  item,
  onClick,
  companyColor,
  onEdit,
  onDelete,
  canEdit = false
}) => {
  // Convert AccessItem to PasswordItem format
  // Ensure password is always a string (never null/undefined)
  const passwordItem: PasswordItem = {
    id: item.id,
    tool_name: item.tool_name,
    username: item.username,
    password: item.password || '', // Ensure password is always a string
    url: item.url,
    notes: item.notes
  };

  return (
    <PasswordCard
      item={passwordItem}
      onClick={onClick}
      companyColor={companyColor}
      onEdit={onEdit as any}
      onDelete={onDelete as any}
      canEdit={canEdit}
    />
  );
};

