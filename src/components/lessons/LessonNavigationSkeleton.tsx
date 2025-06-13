
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";

export const LessonNavigationSkeleton: React.FC = () => {
  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        {/* Sidebar skeleton */}
        <div className="lg:w-1/4 lg:min-h-full border-r border-border/60 bg-muted/20">
          <div className="lg:w-[calc(25%-1px)] lg:fixed top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
            {/* Back button skeleton */}
            <div className="p-6 pb-4 border-b border-border/40">
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Admin button skeleton */}
            <div className="px-6 py-4 border-b border-border/40">
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Playlist skeleton */}
            <div className="p-4">
              <div className="bg-background rounded-lg p-6">
                <div className="mb-6 pb-4 border-b border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="border-border/60">
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-6 w-16 rounded-full" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                          <Skeleton className="w-8 h-8 rounded-full" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content area skeleton */}
        <div className="flex-1 p-6 lg:px-10 lg:py-8">
          {/* Loading spinner overlay */}
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-t-2 border-primary border-r-2 rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-muted-foreground">Carregando aula...</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
