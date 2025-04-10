
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const LessonSkeleton: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </DashboardLayout>
  );
};
