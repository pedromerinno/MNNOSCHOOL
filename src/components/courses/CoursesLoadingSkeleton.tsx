
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CoursesLoadingSkeletonProps {
  count?: number;
}

export const CoursesLoadingSkeleton: React.FC<CoursesLoadingSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="relative h-full w-full">
            {/* Image placeholder with gradient overlay */}
            <div className="w-full h-2/3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse"></div>
            
            {/* Content placeholder */}
            <div className="p-5 space-y-4">
              {/* Tags placeholders - more minimal */}
              <div className="flex gap-2 mb-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-5 w-14 rounded-full" />
                ))}
              </div>
              
              {/* Title placeholder - slightly larger */}
              <Skeleton className="h-5 w-4/5" />
              
              {/* Description placeholder - shorter */}
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
