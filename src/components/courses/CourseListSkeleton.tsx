
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const CourseListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col rounded-lg overflow-hidden h-[250px]">
          <Skeleton className="h-40 w-full rounded-t-lg" />
          <div className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};
