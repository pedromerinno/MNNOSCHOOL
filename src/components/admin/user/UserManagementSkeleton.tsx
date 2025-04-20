
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const UserManagementSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
