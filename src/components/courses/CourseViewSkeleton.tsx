import React from 'react';

export const CourseViewSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-4 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-8 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero skeleton */}
          <div className="relative rounded-xl overflow-hidden h-[400px] bg-muted animate-pulse" />
          
          {/* Stats bar skeleton */}
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>

          {/* Progress box skeleton */}
          <div className="h-24 bg-muted rounded-lg animate-pulse" />

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card p-6">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


