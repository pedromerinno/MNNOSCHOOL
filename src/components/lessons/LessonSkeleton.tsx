
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const LessonSkeleton: React.FC = () => {
  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        {/* Sidebar skeleton */}
        <div className="lg:w-1/4 lg:min-h-full border-r border-border">
          <div className="fixed lg:w-[calc(25%-1px)] top-[80px] h-[calc(100vh-80px)] overflow-y-auto pb-6">
            {/* Back button skeleton */}
            <div className="px-4 pt-6 mb-4">
              <Skeleton className="h-9 w-full" />
            </div>
            
            {/* Playlist header skeleton */}
            <div className="px-4 mb-4 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            
            {/* Playlist items skeleton */}
            <div className="px-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content area skeleton */}
        <div className="flex-1 p-6 lg:px-8">
          {/* Lesson header skeleton */}
          <div className="mb-4">
            <Skeleton className="h-10 w-3/4 mb-4" /> {/* Title */}
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-6 w-20" /> {/* Lesson type */}
              <Skeleton className="h-6 w-24" /> {/* Duration */}
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-32" /> {/* Like button */}
            <Skeleton className="h-10 w-44" /> {/* Complete button */}
          </div>
          
          <div className="mt-6 space-y-8">
            {/* Video skeleton */}
            <Card className="p-0 border overflow-hidden">
              <Skeleton className="aspect-video w-full" /> 
            </Card>
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            
            {/* Comments skeleton */}
            <div className="mt-8">
              <Skeleton className="h-8 w-32 mb-4" /> {/* Comments title */}
              <Card className="p-6 border">
                {/* Comment form skeleton */}
                <div className="flex gap-3 mb-8">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-10 flex-shrink-0 self-end" />
                </div>

                {/* Comments list skeleton */}
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-4 w-32" /> {/* Username */}
                        <Skeleton className="h-3 w-24" /> {/* Date */}
                      </div>
                      <Skeleton className="h-16 w-full" /> {/* Comment content */}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-4 w-32" /> {/* Username */}
                        <Skeleton className="h-3 w-24" /> {/* Date */}
                      </div>
                      <Skeleton className="h-16 w-full" /> {/* Comment content */}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
