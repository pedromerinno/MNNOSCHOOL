
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const UserHomeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Quick Links Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card">
              <CardContent className="p-6 text-center space-y-3">
                <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Widgets Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-8 flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="px-8 pb-8 flex-1 space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};
