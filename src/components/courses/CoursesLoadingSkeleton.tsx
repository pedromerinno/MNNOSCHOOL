
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CoursesLoadingSkeletonProps {
  count?: number;
}

export const CoursesLoadingSkeleton: React.FC<CoursesLoadingSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  );
};
