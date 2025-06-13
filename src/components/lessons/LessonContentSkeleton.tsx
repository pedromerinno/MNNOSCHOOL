
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const LessonContentSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Video/Content skeleton */}
      <Card className="border rounded-lg overflow-hidden shadow-sm">
        <Skeleton className="aspect-video w-full" />
        <CardContent className="p-4">
          <div className="mt-2">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Description skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Comments skeleton */}
      <Card className="p-6 border">
        <Skeleton className="h-6 w-40 mb-6" />
        
        {/* Comment form skeleton */}
        <div className="flex gap-3 mb-8">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-10 flex-shrink-0 self-end" />
        </div>

        {/* Comments list skeleton */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
