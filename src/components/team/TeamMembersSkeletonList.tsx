
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const TeamMembersSkeletonList = React.memo(() => {
  const skeletonArray = Array.from({ length: 6 }, (_, index) => index);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {[1, 2, 3].map((item) => (
          <Card key={item} className="border-0 shadow-sm bg-card">
            <CardContent className="flex items-center p-4">
              <Skeleton className="rounded-full h-10 w-10 mr-3" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {skeletonArray.map((item, index) => (
          <Card key={item} className="overflow-hidden border-0 shadow-sm bg-card rounded-xl">
            <Skeleton className="h-20 w-full" />
            <CardContent className="pt-0 p-4">
              <div className="flex flex-col">
                <div className="flex items-start -mt-6">
                  <Skeleton className="h-12 w-12 rounded-full border-4 border-background" />
                </div>
                
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});
