
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const IndexLoadingState = React.memo(() => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-fade-in">
    <div className="w-full max-w-xl space-y-4">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-3 w-36 rounded-full" />
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-36 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
));
