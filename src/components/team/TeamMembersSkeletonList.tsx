
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const TeamMembersSkeletonList = () => {
  // Create an array to determine how many skeleton cards to display
  const skeletonArray = Array.from({ length: 6 }, (_, index) => index);

  return (
    <div className="space-y-6">
      {/* Skeleton for the metrics dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardContent className="flex items-center p-6">
              <Skeleton className="rounded-full h-12 w-12 mr-4" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Skeleton for team members list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonArray.map((item) => (
          <Card key={item} className="overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl">
            <Skeleton className="h-24 w-full" />
            <CardContent className="pt-0">
              <div className="flex flex-col">
                {/* Profile avatar skeleton */}
                <div className="flex items-start -mt-8">
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                
                {/* User info skeleton */}
                <div className="mt-3 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3 mt-2" />
                  
                  {/* Actions skeleton */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-9 w-full rounded-full" />
                    <Skeleton className="h-9 w-full rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
