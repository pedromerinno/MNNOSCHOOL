
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const IndexSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] h-16">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Skeleton className="h-8 w-24" /> {/* Logo */}
            <div className="hidden md:flex space-x-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome section skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-80 mx-auto" /> {/* Welcome title */}
          <Skeleton className="h-6 w-96 mx-auto" /> {/* Welcome subtitle */}
        </div>

        {/* Quick Links skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card">
              <CardContent className="p-6 text-center space-y-3">
                <Skeleton className="h-12 w-12 rounded-xl mx-auto" /> {/* Icon */}
                <Skeleton className="h-5 w-20 mx-auto" /> {/* Title */}
                <Skeleton className="h-4 w-16 mx-auto" /> {/* Description */}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Widgets skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Widget 1 - Notifications */}
          <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <Skeleton className="h-6 w-32" /> {/* Widget title */}
                <Skeleton className="h-5 w-8" /> {/* Count */}
              </div>
              <div className="px-8 pb-8 flex-1 space-y-4 pt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget 2 - Feedback */}
          <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <Skeleton className="h-6 w-24" /> {/* Widget title */}
                <Skeleton className="h-5 w-8" /> {/* Count */}
              </div>
              <div className="px-8 pb-8 flex-1 space-y-4 pt-6">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget 3 - Calendar */}
          <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <Skeleton className="h-6 w-20" /> {/* Calendar title */}
                <Skeleton className="h-8 w-8" /> {/* Calendar icon */}
              </div>
              <div className="px-8 pb-8 flex-1 pt-6">
                {/* Calendar header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <Skeleton key={i} className="h-6 w-6 mx-auto" />
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {Array(35).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 mx-auto" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional content skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" /> {/* Section title */}
            <Skeleton className="h-4 w-20" /> {/* View all link */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-card rounded-2xl border-0 shadow-none">
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="py-16 text-center">
        <div className="w-full px-4 lg:px-8">
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </footer>
    </div>
  );
};
