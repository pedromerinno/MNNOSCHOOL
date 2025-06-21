
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";

export const AdminPageSkeleton: React.FC = () => {
  return (
    <>
      {/* Navigation Menu Skeleton */}
      <div className="w-full bg-white dark:bg-card border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-32" /> {/* Logo */}
              <div className="hidden md:flex space-x-6">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <div className="container mx-auto px-0 lg:px-4 py-6 max-w-[1500px]">
          <SidebarProvider defaultOpen={true}>
            <div className="flex w-full min-h-[calc(100vh-120px)] rounded-lg overflow-hidden bg-transparent shadow-sm border border-gray-200/50">
              {/* Sidebar Skeleton */}
              <div className="w-64 bg-white dark:bg-card border-r border-gray-200 dark:border-gray-800 p-4">
                <div className="space-y-4">
                  {/* Sidebar header */}
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  
                  {/* Sidebar menu items */}
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                      <div key={item} className="flex items-center space-x-3 p-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Sidebar footer */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-3 p-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content Skeleton */}
              <div className="flex-1 overflow-auto bg-transparent">
                <div className="p-6 h-full">
                  <Card>
                    <CardContent className="p-6">
                      {/* Header skeleton */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-3">
                          <Skeleton className="h-8 w-48" />
                          <Skeleton className="h-4 w-80" />
                        </div>
                        <div className="flex gap-3">
                          <Skeleton className="h-10 w-28" />
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </div>
                      
                      {/* Search/Filter Bar skeleton */}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3">
                          <Skeleton className="h-10 w-64" /> {/* Search bar */}
                          <Skeleton className="h-10 w-24" /> {/* Filter button */}
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-10 w-16" />
                        </div>
                      </div>
                      
                      {/* Table/Grid Content skeleton */}
                      <div className="space-y-4">
                        {/* Table header skeleton */}
                        <div className="grid grid-cols-12 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <Skeleton className="h-4 col-span-3" />
                          <Skeleton className="h-4 col-span-2" />
                          <Skeleton className="h-4 col-span-2" />
                          <Skeleton className="h-4 col-span-2" />
                          <Skeleton className="h-4 col-span-2" />
                          <Skeleton className="h-4 col-span-1" />
                        </div>
                        
                        {/* Table rows skeleton */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                          <div key={item} className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="col-span-3 flex items-center space-x-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                            <Skeleton className="h-6 col-span-2" />
                            <Skeleton className="h-6 col-span-2" />
                            <Skeleton className="h-6 col-span-2" />
                            <div className="col-span-2 flex items-center">
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="col-span-1 flex gap-2">
                              <Skeleton className="h-8 w-8 rounded" />
                              <Skeleton className="h-8 w-8 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination skeleton */}
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </>
  );
};
