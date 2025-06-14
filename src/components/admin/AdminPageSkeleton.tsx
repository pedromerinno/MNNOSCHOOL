
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";

export const AdminPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <div className="container mx-auto px-0 lg:px-4 py-6 max-w-[1500px]">
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full min-h-[calc(100vh-120px)] rounded-lg overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="w-64 bg-white dark:bg-card border-r border-gray-200 dark:border-gray-800 p-4">
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton key={item} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Main Content Skeleton */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <Card>
                  <CardContent className="p-6">
                    {/* Header skeleton */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                    
                    {/* Table skeleton */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4 py-3 border-b">
                        <Skeleton className="h-4 col-span-3" />
                        <Skeleton className="h-4 col-span-2" />
                        <Skeleton className="h-4 col-span-2" />
                        <Skeleton className="h-4 col-span-2" />
                        <Skeleton className="h-4 col-span-3" />
                      </div>
                      
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="grid grid-cols-12 gap-4 py-3">
                          <Skeleton className="h-6 col-span-3" />
                          <Skeleton className="h-6 col-span-2" />
                          <Skeleton className="h-6 col-span-2" />
                          <Skeleton className="h-6 col-span-2" />
                          <div className="col-span-3 flex gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};
