
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
          <div className="sticky top-0 pt-6 h-full max-h-screen pb-6 px-4">
            {/* Back button skeleton */}
            <div className="mb-4">
              <Skeleton className="h-9 w-full" />
            </div>
            
            {/* Playlist header skeleton */}
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            
            {/* Playlist items skeleton */}
            <div className="space-y-3">
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
          <div className="mb-6">
            <Skeleton className="h-10 w-3/4 mb-4" /> {/* Title */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-20" /> {/* Lesson type */}
              <Skeleton className="h-5 w-24" /> {/* Duration */}
            </div>
          </div>
          
          <div className="mt-6 space-y-8">
            {/* Video skeleton */}
            <Card className="p-0 border overflow-hidden">
              <Skeleton className="aspect-video w-full" /> 
            </Card>
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            
            {/* Actions skeleton */}
            <div className="flex items-center justify-between gap-4 py-4">
              <Skeleton className="h-10 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
            
            {/* Comments skeleton */}
            <div className="mt-8 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
