
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingState: React.FC = React.memo(() => {
  return (
    <div className="flex justify-center items-center h-64 animate-fade-in">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
});
