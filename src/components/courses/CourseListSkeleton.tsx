
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const CourseListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 h-[300px] bg-white dark:bg-gray-900 shadow-sm">
          {/* Course thumbnail skeleton with shimmer effect */}
          <div className="relative h-40 w-full overflow-hidden">
            <Skeleton className="h-full w-full absolute" />
          </div>
          
          {/* Content area */}
          <div className="p-4 space-y-3">
            {/* Tags with different widths */}
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            
            {/* Title with variable width */}
            <Skeleton className="h-5 w-4/5" />
            
            {/* Description with multiple lines */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            
            {/* Metadata with instructor avatar and name */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
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
