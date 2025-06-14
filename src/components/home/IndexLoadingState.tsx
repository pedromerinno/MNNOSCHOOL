
import { Skeleton } from "@/components/ui/skeleton";

export const IndexLoadingState = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-3 w-48 rounded-full" />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
