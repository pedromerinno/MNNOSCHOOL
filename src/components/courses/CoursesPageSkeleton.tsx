
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const CoursesPageSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Featured Course Carousel Skeleton */}
      <div className="w-full px-0">
        <div className="w-full relative overflow-hidden py-0">
          <div className="w-full max-w-4xl mx-auto">
            <div className="relative h-[600px] rounded-2xl overflow-hidden">
              {/* Main image skeleton */}
              <Skeleton className="w-full h-full absolute inset-0" />
              
              {/* Company logo skeleton */}
              <div className="absolute top-8 left-8">
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
              
              {/* Content overlay skeleton */}
              <div className="absolute bottom-0 left-0 right-0 p-8 py-[40px] px-[40px]">
                <div className="flex justify-between items-end">
                  <div className="space-y-4 max-w-xl">
                    {/* Tags skeleton */}
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20 rounded-full" />
                      <Skeleton className="h-8 w-16 rounded-full" />
                      <Skeleton className="h-8 w-18 rounded-full" />
                    </div>
                    
                    {/* Title skeleton */}
                    <Skeleton className="h-12 w-96" />
                    
                    {/* Description skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-80" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  
                  {/* Action button skeleton */}
                  <Skeleton className="h-12 w-32 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="w-full max-w-screen-xl mx-auto space-y-8 px-4">
        {/* Categories section skeleton */}
        <div className="space-y-4 py-[30px]">
          <Skeleton className="h-6 w-32" /> {/* "Categorias" title */}
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-10 w-16 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-18 rounded-full" />
            <Skeleton className="h-10 w-22 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        {/* All courses section skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-40" /> {/* "Todos os cursos" title */}
          
          {/* Courses grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="group relative aspect-[4/3] rounded-lg overflow-hidden">
                {/* Course image skeleton */}
                <Skeleton className="w-full h-full" />
                
                {/* Content overlay skeleton */}
                <div className="absolute bottom-0 left-0 right-0 p-4 px-[20px] py-[20px]">
                  <div className="space-y-2">
                    {/* Tags skeleton */}
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-12 rounded-xl" />
                      <Skeleton className="h-6 w-16 rounded-xl" />
                    </div>
                    
                    {/* Title skeleton */}
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
