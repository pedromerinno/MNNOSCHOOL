
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const CourseListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 h-[300px] bg-white dark:bg-gray-900 shadow-sm">
          {/* Course thumbnail skeleton */}
          <Skeleton className="h-40 w-full" />
          
          {/* Content area */}
          <div className="p-4 space-y-3">
            {/* Tags */}
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            
            {/* Title */}
            <Skeleton className="h-5 w-4/5" />
            
            {/* Description */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            
            {/* Metadata */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
