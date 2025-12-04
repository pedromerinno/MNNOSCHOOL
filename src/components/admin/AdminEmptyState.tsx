import React from 'react';
import { LucideIcon } from 'lucide-react';
import { EmptyState as EmptyStateComponent } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn("flex justify-center", className)}>
      <EmptyStateComponent
        title={title}
        description={description || ""}
        icons={[icon]}
        action={action}
      />
    </div>
  );
};
