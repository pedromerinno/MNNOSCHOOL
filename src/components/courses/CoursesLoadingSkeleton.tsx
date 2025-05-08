
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CoursesLoadingSkeletonProps {
  count?: number;
}

export const CoursesLoadingSkeleton: React.FC<CoursesLoadingSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800">
            {/* Image placeholder */}
            <div className="w-full h-full">
              <Skeleton className="h-full w-full" />
            </div>
            
            {/* Bottom gradient and content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent">
              {/* Tags placeholders with different widths */}
              <div className="flex gap-2 mb-2">
                {[12, 16, 10].map((width, i) => (
                  <Skeleton key={i} className={`h-6 w-${width} rounded-xl bg-white/20`} />
                ))}
              </div>
              
              {/* Title placeholder */}
              <Skeleton className="h-5 w-3/4 bg-white/20 mb-1" />
              <Skeleton className="h-4 w-1/2 bg-white/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
