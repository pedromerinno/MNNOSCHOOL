
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const CourseListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <Skeleton className="h-40 w-full" />
          <div className="p-4 space-y-3">
            {/* Tags skeleton */}
            <div className="flex flex-wrap gap-2">
              {[...Array(2)].map((_, j) => (
                <Skeleton key={j} className="h-5 w-16 rounded-full" />
              ))}
            </div>
            
            {/* Title skeleton */}
            <Skeleton className="h-6 w-4/5" />
            
            {/* Description skeleton */}
            <Skeleton className="h-4 w-3/5" />
            
            {/* Progress bar skeleton */}
            <div className="pt-4">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            
            {/* Footer skeleton */}
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
