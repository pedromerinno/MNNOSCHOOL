
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const CourseListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="aspect-video bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse"></div>
          <div className="p-4 space-y-3">
            {/* Tags skeleton - more minimal */}
            <div className="flex flex-wrap gap-2">
              {[...Array(2)].map((_, j) => (
                <Skeleton key={j} className="h-5 w-14 rounded-full" />
              ))}
            </div>
            
            {/* Title skeleton - slightly larger */}
            <Skeleton className="h-6 w-4/5" />
            
            {/* Description skeleton - shorter */}
            <Skeleton className="h-4 w-3/5" />
            
            {/* Progress bar skeleton */}
            <div className="pt-3">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            
            {/* Footer skeleton - simplified */}
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
