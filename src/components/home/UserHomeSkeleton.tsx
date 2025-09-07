
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const UserHomeSkeleton: React.FC = React.memo(() => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Welcome Section Skeleton */}
        <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>

        {/* Quick Links Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-4 text-center space-y-2">
                <Skeleton className="h-10 w-10 rounded-lg mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Widgets Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
});
