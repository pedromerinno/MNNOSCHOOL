
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";

export const LessonSkeleton: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Lesson Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-6" /> {/* Back button */}
          <Skeleton className="h-10 w-3/4 mb-4" /> {/* Title */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-20" /> {/* Lesson type */}
            <Skeleton className="h-5 w-24" /> {/* Duration */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Content Card */}
            <Card className="p-0 border border-border overflow-hidden">
              <Skeleton className="h-[400px] w-full" /> {/* Video/content area */}
            </Card>

            {/* Description and Actions */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-4 py-4">
                <Skeleton className="h-10 w-32" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center border-t border-border mt-8 pt-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Card>
              <div className="p-4 border-b">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
