
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const IndexSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm h-16">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Skeleton className="h-6 w-20" />
            <div className="hidden md:flex space-x-6">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Welcome section */}
        <div className="mb-12 mt-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-16 w-96 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-4 flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="mr-2 bg-muted p-2 rounded-lg">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {/* Calendar Widget */}
          <Card className="border-0 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-0 flex flex-col">
              <div className="p-6 flex justify-between items-center border-b">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-7 gap-1">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((_, i) => (
                    <Skeleton key={i} className="h-5 w-5 mx-auto" />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(21).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-6 mx-auto" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Widget */}
          <Card className="border-0 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-0 flex flex-col">
              <div className="p-6 flex justify-between items-center border-b">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-6" />
              </div>
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3 p-2 rounded-lg">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Widget */}
          <Card className="border-0 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-0 flex flex-col">
              <div className="p-6 flex justify-between items-center border-b">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-6" />
              </div>
              <div className="p-6 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <div className="container mx-auto px-4">
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      </footer>
    </div>
  );
});
