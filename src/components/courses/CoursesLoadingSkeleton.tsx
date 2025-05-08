
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CoursesLoadingSkeletonProps {
  count?: number;
}

export const CoursesLoadingSkeleton: React.FC<CoursesLoadingSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="relative h-full w-full animate-pulse">
            {/* Image placeholder */}
            <div className="w-full h-2/3 bg-gray-200 dark:bg-gray-800"></div>
            
            {/* Content placeholder */}
            <div className="p-4 space-y-3">
              {/* Tags placeholders */}
              <div className="flex gap-2 mb-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-xl" />
                ))}
              </div>
              
              {/* Title placeholder */}
              <Skeleton className="h-5 w-3/4" />
              
              {/* Description placeholder */}
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
