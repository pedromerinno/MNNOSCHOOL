
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const SuggestedCoursesSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8">
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Action button skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Courses grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Course image skeleton */}
                <Skeleton className="h-48 w-full" />
                
                <div className="p-6 space-y-4">
                  {/* Course title skeleton */}
                  <Skeleton className="h-6 w-3/4" />
                  
                  {/* Course description skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  
                  {/* Instructor info skeleton */}
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  
                  {/* Reason section skeleton */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  
                  {/* Action button skeleton */}
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
