
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const IntegrationPageSkeleton: React.FC = React.memo(() => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm h-16">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Skeleton className="h-4 w-16" />
            <div className="hidden md:flex space-x-6">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Company header */}
        <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-3 w-72 mx-auto" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-5 w-36" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-4">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-4">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});
