
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DiscussionSkeleton: React.FC = React.memo(() => {
  return (
    <Card className="animate-fade-in border-0 shadow-sm bg-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-5 w-1/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </CardContent>
    </Card>
  );
});
